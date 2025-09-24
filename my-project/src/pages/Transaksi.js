import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Transaksi.css";
import { API_URL } from "../utils/constants";

function Transaksi() {
  const [transaksi, setTransaksi] = useState([]);

  const loadData = () => {
    axios
      .get(API_URL + "pesanans")
      .then((res) => setTransaksi(res.data))
      .catch((err) => console.error("Error ambil transaksi:", err));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = (id) => {
    if (window.confirm("Yakin hapus transaksi ini?")) {
      axios
        .delete(API_URL + "pesanans/" + id)
        .then(() => loadData())
        .catch((err) => console.error("Gagal hapus transaksi:", err));
    }
  };

  const handleEdit = (id) => {
    const newTotal = prompt("Masukkan total baru:");
    if (newTotal && !isNaN(newTotal)) {
      axios
        .patch(API_URL + "pesanans/" + id, { total_bayar: parseInt(newTotal) })
        .then(() => loadData())
        .catch((err) => console.error("Gagal edit transaksi:", err));
    }
  };

  return (
    <div className="transaksi-container">
      <h2>History Transaksi</h2>
      <table className="transaksi-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Tanggal</th>
            <th>Detail Menu</th>
            <th>Total Bayar</th>
            <th>Metode Pembayaran</th>
            <th>Uang Dibayar</th>
            <th>Kembalian</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {transaksi.map((t) => (
            <tr key={t.id}>
              <td>{t.id}</td>
              <td>
                {t.tanggal
                  ? new Date(t.tanggal).toLocaleString("id-ID")
                  : "-"}
              </td>
              <td>
                <ul>
                  {t.menus.map((m) => (
                    <li key={m.id}>
                      {m.product.nama} x {m.jumlah} = Rp
                      {m.total_harga.toLocaleString("id-ID")}
                    </li>
                  ))}
                </ul>
              </td>
              <td>Rp{t.total_bayar.toLocaleString("id-ID")}</td>
              <td>{t.metode_pembayaran || "-"}</td>
              <td>
                Rp{t.uang_dibayar ? t.uang_dibayar.toLocaleString("id-ID") : "0"}
              </td>
              <td>
                Rp{t.kembalian ? t.kembalian.toLocaleString("id-ID") : "0"}
              </td>
              <td>
                <button
                  onClick={() => handleEdit(t.id)}
                  style={{
                    marginRight: "8px",
                    background: "orange",
                    color: "white",
                    border: "none",
                    padding: "5px 10px",
                    borderRadius: "4px",
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(t.id)}
                  style={{
                    background: "red",
                    color: "white",
                    border: "none",
                    padding: "5px 10px",
                    borderRadius: "4px",
                  }}
                >
                  Hapus
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Transaksi;
