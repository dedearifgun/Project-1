import React, { useState, useEffect } from "react";
import { Container, Form, Button } from "react-bootstrap";
import axios from "axios";
import { API_URL } from "../utils/constants";
import swal from "sweetalert";

function TambahProduk({ history }) {
  const [kode, setKode] = useState("");
  const [nama, setNama] = useState("");
  const [harga, setHarga] = useState("");
  const [stok, setStok] = useState("");
  const [gambar, setGambar] = useState("");
  const [isReady, setIsReady] = useState(true);
  const [kategori, setKategori] = useState("");
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    axios
      .get(API_URL + "categories")
      .then((res) => setCategories(res.data))
      .catch((err) => console.error(err));
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setGambar(file.name); // hanya simpan nama file
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!kode || !nama || !harga || !stok || !kategori || !gambar) {
      swal("Gagal!", "Harap isi semua field!", "error");
      return;
    }

    const selectedCategory = categories.find((c) => c.id == kategori);

    if (!selectedCategory) {
      swal("Gagal!", "Kategori tidak valid!", "error");
      return;
    }

    const newProduct = {
      kode,
      nama,
      harga: parseInt(harga),
      stok: parseInt(stok),
      is_ready: isReady,
      gambar,
      category: {
        id: kategori,
        nama: selectedCategory.nama,
      },
    };

    axios
      .post(API_URL + "product", newProduct)
      .then(() => {
        swal("Sukses!", "Produk berhasil ditambahkan!", "success");
        history.push("/");
      })
      .catch((err) => console.error("Gagal tambah produk:", err));
  };

  return (
    <Container className="mt-4">
      <h2>Tambah Produk Baru</h2>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Kode Produk</Form.Label>
          <Form.Control
            type="text"
            value={kode}
            onChange={(e) => setKode(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Nama Produk</Form.Label>
          <Form.Control
            type="text"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Harga</Form.Label>
          <Form.Control
            type="number"
            value={harga}
            onChange={(e) => setHarga(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Stok</Form.Label>
          <Form.Control
            type="number"
            value={stok}
            onChange={(e) => setStok(e.target.value)}
          />
        </Form.Group>

        {/* ✅ Upload gambar */}
        <Form.Group className="mb-3">
          <Form.Label>Upload Gambar</Form.Label>
          <Form.Control
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />
          {gambar && (
            <small className="text-success">
              Gambar dipilih: {gambar} (copy file ke folder <b>/public/images</b>)
            </small>
          )}
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Kategori</Form.Label>
          <Form.Select
            value={kategori}
            onChange={(e) => setKategori(e.target.value)}
          >
            <option value="">Pilih Kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nama}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Check
            type="checkbox"
            label="Produk Ready?"
            checked={isReady}
            onChange={(e) => setIsReady(e.target.checked)}
          />
        </Form.Group>

        <Button type="submit" variant="primary">
          Simpan
        </Button>
      </Form>
    </Container>
  );
}

export default TambahProduk;
