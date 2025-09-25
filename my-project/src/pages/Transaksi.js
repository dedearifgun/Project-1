import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Transaksi.css";
import { API_URL } from "../utils/constants";
import { Button, Modal } from "react-bootstrap";
import { numberWithCommas } from "../utils/utils";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function Transaksi() {
  const [transaksi, setTransaksi] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [searchResult, setSearchResult] = useState([]);

  // modal struk
  const [showStruk, setShowStruk] = useState(false);
  const [selectedTransaksi, setSelectedTransaksi] = useState(null);

  useEffect(() => {
    axios
      .get(API_URL + "pesanans")
      .then((res) => {
        setTransaksi(res.data);
        setSearchResult(res.data);
      })
      .catch((err) => console.error("Error ambil transaksi:", err));
  }, []);

  // filter pencarian
  const handleSearch = () => {
    let hasil = transaksi;

    if (searchTerm) {
      hasil = hasil.filter(
        (t) =>
          t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.menus?.some((m) =>
            m.product?.nama
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase())
          )
      );
    }

    if (dateFrom && dateTo) {
      hasil = hasil.filter((t) => {
        if (!t.tanggal) return false;
        const trxDate = new Date(t.tanggal).toISOString().slice(0, 10);
        return trxDate >= dateFrom && trxDate <= dateTo;
      });
    }

    setSearchResult(hasil);
  };

  // cetak ulang struk
  const handleCetakUlang = (trx) => {
    setSelectedTransaksi(trx);
    setShowStruk(true);
  };

  // download PDF struk per transaksi
  const downloadPDF = (trx) => {
    const doc = new jsPDF({ unit: "mm", format: [58, 200] });
    doc.setFontSize(10);
    doc.text("Saung Sunda Pileuleuyan", 29, 6, { align: "center" });
    doc.setFontSize(8);
    doc.text(
      trx.tanggal ? new Date(trx.tanggal).toLocaleString() : "-",
      29,
      12,
      { align: "center" }
    );
    doc.text("--------------------------------", 29, 16, { align: "center" });

    const tableColumn = ["Produk", "Qty", "Total"];
    const tableRows = [];
    trx.menus?.forEach((item) => {
      tableRows.push([
        item.product?.nama || "-",
        item.jumlah?.toString() || "0",
        "Rp " + numberWithCommas(item.total_harga || 0),
      ]);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      styles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 10, halign: "center" },
        2: { cellWidth: 20, halign: "right" },
      },
    });

    let y = doc.lastAutoTable.finalY + 6;
    doc.text(`Diskon: ${trx.diskon || 0}%`, 2, y);
    y += 5;
    doc.text(`Metode: ${trx.metode_pembayaran || "-"}`, 2, y);
    y += 5;
    doc.text(`Total: Rp${numberWithCommas(trx.total_bayar || 0)}`, 2, y);
    y += 5;
    doc.text(`Dibayar: Rp${numberWithCommas(trx.uang_dibayar || 0)}`, 2, y);
    y += 5;
    doc.text(`Kembalian: Rp${numberWithCommas(trx.kembalian || 0)}`, 2, y);

    y += 10;
    doc.text("🙏 Terima Kasih 🙏", 29, y, { align: "center" });

    doc.save(`struk-${trx.id}.pdf`);
  };

  // export laporan PDF semua transaksi
  const exportLaporanPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Laporan Transaksi", 105, 10, { align: "center" });

    const tableColumn = ["ID", "Tanggal", "Total Bayar", "Metode", "Diskon"];
    const tableRows = [];

    searchResult.forEach((t) => {
      tableRows.push([
        t.id,
        t.tanggal ? new Date(t.tanggal).toLocaleString() : "-",
        "Rp " + numberWithCommas(t.total_bayar || 0),
        t.metode_pembayaran || "-",
        `${t.diskon || 0}%`,
      ]);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.save("laporan-transaksi.pdf");
  };

  // export laporan CSV semua transaksi
  const exportCSV = () => {
    let csv = "ID,Tanggal,Total Bayar,Metode,Diskon\n";
    searchResult.forEach((t) => {
      csv += `${t.id},${t.tanggal || "-"},${t.total_bayar},${t.metode_pembayaran || "-"},${t.diskon || 0}%\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "laporan-transaksi.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="transaksi-container">
      <div className="d-flex justify-content-between mb-3">
        <h2>📜 Daftar Transaksi</h2>
        <div className="d-flex gap-2">
          <input
            type="text"
            placeholder="Cari ID/nama produk..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
          <button onClick={handleSearch}>Filter</button>
          <button onClick={exportLaporanPDF}>Export PDF</button>
          <button onClick={exportCSV}>Export CSV</button>
        </div>
      </div>

      <table className="transaksi-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Tanggal</th>
            <th>Detail Menu</th>
            <th>Total Bayar</th>
            <th>Metode</th>
            <th>Diskon</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {searchResult.map((t) => (
            <tr key={t.id}>
              <td>{t.id}</td>
              <td>{t.tanggal ? new Date(t.tanggal).toLocaleString() : "-"}</td>
              <td>
                <ul>
                  {t.menus?.map((m) => (
                    <li key={m.id}>
                      {m.product?.nama} x {m.jumlah} = Rp
                      {numberWithCommas(m.total_harga)}
                    </li>
                  ))}
                </ul>
              </td>
              <td>Rp{numberWithCommas(t.total_bayar)}</td>
              <td>{t.metode_pembayaran || "-"}</td>
              <td>{t.diskon || 0}%</td>
              <td>
                <Button
                  size="sm"
                  className="me-2"
                  onClick={() => handleCetakUlang(t)}
                >
                  Cetak Struk
                </Button>
                <Button size="sm" variant="danger" onClick={() => downloadPDF(t)}>
                  PDF
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal Cetak Ulang Struk */}
      <Modal show={showStruk} onHide={() => setShowStruk(false)}>
        <Modal.Header closeButton>
          <Modal.Title>🧾 Struk Transaksi</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTransaksi && (
            <div id="print-area">
              <h4>Saung Sunda Pileuleuyan</h4>
              <p>
                {selectedTransaksi.tanggal
                  ? new Date(selectedTransaksi.tanggal).toLocaleString()
                  : "-"}
              </p>
              <table style={{ width: "100%" }}>
                <thead>
                  <tr>
                    <th>Produk</th>
                    <th>Qty</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedTransaksi.menus?.map((item, index) => (
                    <tr key={index}>
                      <td>{item.product?.nama}</td>
                      <td>{item.jumlah}</td>
                      <td>Rp{numberWithCommas(item.total_harga)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p>
                Diskon: {selectedTransaksi.diskon || 0}% <br />
                Metode: {selectedTransaksi.metode_pembayaran || "-"} <br />
                Total: Rp{numberWithCommas(selectedTransaksi.total_bayar)} <br />
                Dibayar: Rp{numberWithCommas(selectedTransaksi.uang_dibayar)}{" "}
                <br />
                Kembalian: Rp{numberWithCommas(selectedTransaksi.kembalian)}
              </p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowStruk(false)}>
            Tutup
          </Button>
          <Button variant="success" onClick={() => window.print()}>
            Cetak
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Transaksi;
