import React, { Component } from "react";
import { Row, Col, Button, Form, Modal } from "react-bootstrap";
import { numberWithCommas } from "../utils/utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingCart, faPrint, faFilePdf } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { API_URL } from "../utils/constants";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default class TotalBayar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      metodePembayaran: "TUNAI",
      uangDibayar: 0,
      diskon: 0,
      showStruk: false,
      transaksi: null,
    };
  }

  // Hitung total bayar dengan diskon %
  hitungTotal = () => {
    const TotalBayar = this.props.keranjangs.reduce(
      (result, item) => result + item.total_harga,
      0
    );
    const { diskon } = this.state;
    const potongan = (TotalBayar * diskon) / 100;
    return Math.max(TotalBayar - potongan, 0);
  };

  // Submit transaksi
  submitTotalBayar = () => {
    const totalBayar = this.hitungTotal();
    const { metodePembayaran, uangDibayar, diskon } = this.state;

    // ✅ Validasi untuk Tunai
    if (metodePembayaran === "TUNAI" && (!uangDibayar || uangDibayar <= 0)) {
      alert("⚠️ Masukkan uang dibayar terlebih dahulu!");
      return;
    }

    if (metodePembayaran === "TUNAI" && uangDibayar < totalBayar) {
      alert("⚠️ Uang dibayar kurang dari total belanja!");
      return;
    }

    const kembalian =
      metodePembayaran === "TUNAI" ? uangDibayar - totalBayar : 0;

    const pesanan = {
      total_bayar: totalBayar,
      menus: this.props.keranjangs,
      metode_pembayaran: metodePembayaran,
      uang_dibayar: metodePembayaran === "TUNAI" ? uangDibayar : totalBayar,
      kembalian: kembalian,
      diskon: diskon,
      tanggal: new Date().toISOString(),
    };

    axios.post(API_URL + "pesanans", pesanan).then(() => {
      // update stok
      this.props.keranjangs.forEach((item) => {
        const produk = item.product;
        const stokBaru = (produk.stok ?? 0) - item.jumlah;
        axios.patch(API_URL + "product/" + produk.id, { stok: stokBaru });
      });

      // tampilkan popup struk
      this.setState({ showStruk: true, transaksi: pesanan });
    });
  };

  // Cetak hanya area struk
  cetakStruk = () => {
    const printContent = document.getElementById("print-area").innerHTML;
    const WindowPrint = window.open("", "", "width=300,height=600");
    WindowPrint.document.write(`
      <html>
        <head>
          <title>Struk Transaksi</title>
          <style>
            body { font-family: monospace; font-size: 12px; }
            h3 { text-align: center; margin: 0; padding: 5px 0; }
            table { width: 100%; border-collapse: collapse; }
            td, th { padding: 2px 0; text-align: left; }
            .total { border-top: 1px dashed #000; margin-top: 5px; padding-top: 5px; }
            .center { text-align: center; }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);
    WindowPrint.document.close();
    WindowPrint.focus();
    WindowPrint.print();
    WindowPrint.close();
  };

  // Download struk ke PDF thermal printer 58mm
  downloadPDF = () => {
    const { transaksi } = this.state;
    if (!transaksi) return;

    const doc = new jsPDF({
      unit: "mm",
      format: [58, 200], // 58mm lebar thermal printer
    });

    doc.setFontSize(10);
    doc.text("Saung Sunda Pileuleuyan", 29, 6, { align: "center" });
    doc.setFontSize(8);
    doc.text(new Date(transaksi.tanggal).toLocaleString(), 29, 12, { align: "center" });
    doc.text("--------------------------------", 29, 16, { align: "center" });

    const tableColumn = ["Produk", "Qty", "Total"];
    const tableRows = [];

    transaksi.menus.forEach((item) => {
      const row = [
        item.product.nama,
        item.jumlah.toString(),
        "Rp " + numberWithCommas(item.total_harga),
      ];
      tableRows.push(row);
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
    doc.text(`Diskon: ${transaksi.diskon}%`, 2, y); y += 5;
    doc.text(`Metode: ${transaksi.metode_pembayaran}`, 2, y); y += 5;
    doc.text(`Total: Rp${numberWithCommas(transaksi.total_bayar)}`, 2, y); y += 5;
    doc.text(`Dibayar: Rp${numberWithCommas(transaksi.uang_dibayar)}`, 2, y); y += 5;
    doc.text(`Kembalian: Rp${numberWithCommas(transaksi.kembalian)}`, 2, y);

    y += 10;
    doc.setFontSize(9);
    doc.text("🙏 Terima Kasih 🙏", 29, y, { align: "center" });

    doc.save("struk-transaksi.pdf");
  };

  render() {
    const totalBayar = this.hitungTotal();
    const { metodePembayaran, uangDibayar, diskon, showStruk, transaksi } =
      this.state;

    return (
      <>
        <div className="fixed-bottom">
          <Row>
            <Col
              md={{ span: 3, offset: 9 }}
              className="px-4 bg-light p-3 rounded"
            >
              <h5>Total Bayar : Rp. {numberWithCommas(totalBayar)}</h5>

              {/* Metode Pembayaran */}
              <Form.Group className="mb-2">
                <Form.Label>Metode Pembayaran</Form.Label>
                <Form.Select
                  value={metodePembayaran}
                  onChange={(e) =>
                    this.setState({ metodePembayaran: e.target.value })
                  }
                >
                  <option value="TUNAI">Tunai</option>
                  <option value="KARTU">Kartu Debit/Kredit</option>
                  <option value="QRIS">QRIS</option>
                </Form.Select>
              </Form.Group>

              {/* Diskon */}
              <Form.Group className="mb-2">
                <Form.Label>Diskon (%)</Form.Label>
                <Form.Control
                  type="number"
                  value={diskon}
                  onChange={(e) =>
                    this.setState({ diskon: parseInt(e.target.value) || 0 })
                  }
                />
              </Form.Group>

              {/* Input Uang Dibayar */}
              {metodePembayaran === "TUNAI" && (
                <Form.Group className="mb-2">
                  <Form.Label>Uang Dibayar</Form.Label>
                  <Form.Control
                    type="number"
                    value={uangDibayar}
                    onChange={(e) =>
                      this.setState({
                        uangDibayar: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                  <small>
                    Kembalian: Rp.{" "}
                    {numberWithCommas(Math.max(uangDibayar - totalBayar, 0))}
                  </small>
                </Form.Group>
              )}

              <div className="d-flex gap-2 mt-3">
                <Button
                  variant="primary"
                  style={{ flex: 1 }}
                  onClick={this.submitTotalBayar}
                >
                  <FontAwesomeIcon icon={faShoppingCart} /> Bayar
                </Button>
              </div>
            </Col>
          </Row>
        </div>

        {/* Modal Struk */}
        <Modal
          show={showStruk}
          onHide={() => this.setState({ showStruk: false })}
        >
          <Modal.Header closeButton>
            <Modal.Title>🧾 Struk Transaksi</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {transaksi && (
              <div id="print-area">
                <h3>🧾 Saung Sunda Pileuleuyan</h3>
                <p className="center">
                  {new Date(transaksi.tanggal).toLocaleString()}
                </p>
                <table style={{ width: "100%" }}>
                  <thead>
                    <tr>
                      <th>Produk</th>
                      <th>Qty</th>
                      <th>Harga</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transaksi.menus.map((item, index) => (
                      <tr key={index}>
                        <td>{item.product.nama}</td>
                        <td>{item.jumlah}</td>
                        <td>{numberWithCommas(item.product.harga)}</td>
                        <td>{numberWithCommas(item.total_harga)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="total mt-2">
                  Diskon: {transaksi.diskon}% <br />
                  Metode: {transaksi.metode_pembayaran} <br />
                  Total Bayar: Rp. {numberWithCommas(transaksi.total_bayar)}{" "}
                  <br />
                  Uang Dibayar: Rp.{" "}
                  {numberWithCommas(transaksi.uang_dibayar)} <br />
                  Kembalian: Rp. {numberWithCommas(transaksi.kembalian)}
                </div>
                <p className="center">🙏 Terima Kasih 🙏</p>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => this.setState({ showStruk: false })}
            >
              Tutup
            </Button>
            <Button variant="success" onClick={this.cetakStruk}>
              <FontAwesomeIcon icon={faPrint} /> Cetak
            </Button>
            <Button variant="danger" onClick={this.downloadPDF}>
              <FontAwesomeIcon icon={faFilePdf} /> PDF
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  }
}
