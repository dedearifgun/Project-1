import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Button, Form, Modal } from "react-bootstrap";
import { API_URL } from "../utils/constants";
import swal from "sweetalert";

function Stock() {
  const [produk, setProduk] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [stokBaru, setStokBaru] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResult, setSearchResult] = useState([]);

  // Modal tambah produk
  const [showModal, setShowModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    kode: "",
    nama: "",
    harga: "",
    stok: 0,
    category: { id: 1, nama: "Makanan" },
    gambar: "default.jpg",
    is_ready: true,
  });

  useEffect(() => {
    getProduk();
  }, []);

  const getProduk = () => {
    axios
      .get(API_URL + "product")
      .then((res) => {
        setProduk(res.data);
        setSearchResult(res.data);
      })
      .catch((err) => console.error("❌ Error ambil produk:", err));
  };

  // Edit stok
  const handleEdit = (id, stok) => {
    setEditingId(id);
    setStokBaru({ ...stokBaru, [id]: stok });
  };

  const handleSave = (id) => {
    const stok = parseInt(stokBaru[id]);
    axios
      .patch(API_URL + "product/" + id, { stok })
      .then(() => {
        setProduk(produk.map((p) => (p.id === id ? { ...p, stok } : p)));
        setSearchResult(searchResult.map((p) => (p.id === id ? { ...p, stok } : p)));
        setEditingId(null);
        swal("Sukses!", "Stok berhasil diperbarui 👍", "success");
      })
      .catch(() => swal("Error", "Gagal memperbarui stok", "error"));
  };

  // Hapus produk
  const handleDelete = (id, nama) => {
    swal({
      title: "Yakin?",
      text: `Apakah kamu yakin ingin menghapus produk "${nama}"?`,
      icon: "warning",
      buttons: ["Batal", "Ya, Hapus"],
      dangerMode: true,
    }).then((willDelete) => {
      if (willDelete) {
        axios
          .delete(API_URL + "product/" + id)
          .then(() => {
            setProduk(produk.filter((p) => p.id !== id));
            setSearchResult(searchResult.filter((p) => p.id !== id));
            swal("Sukses!", "Produk berhasil dihapus", "success");
          })
          .catch(() => swal("Error", "Produk gagal dihapus", "error"));
      }
    });
  };

  // Cari produk
  const handleSearch = () => {
    if (!searchTerm) {
      setSearchResult(produk);
    } else {
      const hasil = produk.filter(
        (p) =>
          p.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.kode.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSearchResult(hasil);
    }
  };

  // Tambah produk
  const handleAddProduct = () => {
    if (!newProduct.kode || !newProduct.nama || !newProduct.harga) {
      swal("Error", "Kode, Nama, dan Harga harus diisi!", "error");
      return;
    }

    axios
      .post(API_URL + "product", newProduct)
      .then(() => {
        setShowModal(false);
        setNewProduct({
          kode: "",
          nama: "",
          harga: "",
          stok: 0,
          category: { id: 1, nama: "Makanan" },
          gambar: "default.jpg",
          is_ready: true,
        });
        getProduk();
        swal("Sukses!", "Produk baru berhasil ditambahkan 🎉", "success");
      })
      .catch(() => swal("Error", "Gagal menambahkan produk baru", "error"));
  };

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between mb-3">
        <h2>📦 Manajemen Stok Barang</h2>
        <div className="d-flex gap-2">
          <Form.Control
            type="text"
            placeholder="Cari produk..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button variant="primary" onClick={handleSearch}>
            Cari
          </Button>
          <Button variant="success" onClick={() => setShowModal(true)}>
            + Tambah Produk
          </Button>
        </div>
      </div>

      {/* Tabel Produk */}
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Kode</th>
            <th>Nama Produk</th>
            <th>Harga</th>
            <th>Stok</th>
            <th>Gambar</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {searchResult.map((p) => (
            <tr key={p.id}>
              <td>{p.kode}</td>
              <td>{p.nama}</td>
              <td>Rp{p.harga.toLocaleString()}</td>
              <td>
                {editingId === p.id ? (
                  <Form.Control
                    type="number"
                    value={stokBaru[p.id]}
                    onChange={(e) =>
                      setStokBaru({ ...stokBaru, [p.id]: e.target.value })
                    }
                  />
                ) : (
                  p.stok ?? 0
                )}
              </td>
              <td>
                <img
                  src={`images/${p.category.nama.toLowerCase()}/${p.gambar}`}
                  alt={p.nama}
                  width={50}
                />
              </td>
              <td>
                {editingId === p.id ? (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => handleSave(p.id)}
                  >
                    Simpan
                  </Button>
                ) : (
                  <>
                    <Button
                      size="sm"
                      variant="warning"
                      className="me-2"
                      onClick={() => handleEdit(p.id, p.stok ?? 0)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDelete(p.id, p.nama)}
                    >
                      Hapus
                    </Button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal Tambah Produk */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Tambah Produk Baru</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-2">
              <Form.Label>Kode Produk</Form.Label>
              <Form.Control
                type="text"
                value={newProduct.kode}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, kode: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Nama Produk</Form.Label>
              <Form.Control
                type="text"
                value={newProduct.nama}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, nama: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Harga</Form.Label>
              <Form.Control
                type="number"
                value={newProduct.harga}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    harga: parseInt(e.target.value),
                  })
                }
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Stok</Form.Label>
              <Form.Control
                type="number"
                value={newProduct.stok}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    stok: parseInt(e.target.value),
                  })
                }
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Kategori</Form.Label>
              <Form.Select
                value={newProduct.category.nama}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    category: {
                      id:
                        e.target.value === "Makanan"
                          ? 1
                          : e.target.value === "Minuman"
                          ? 2
                          : 3,
                      nama: e.target.value,
                    },
                  })
                }
              >
                <option>Makanan</option>
                <option>Minuman</option>
                <option>Cemilan</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Batal
          </Button>
          <Button variant="primary" onClick={handleAddProduct}>
            Simpan
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Stock;
