import React, { Component } from "react";
import { Row, Col, Button, Form } from "react-bootstrap";
import { numberWithCommas } from "../utils/utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingCart } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { API_URL } from "../utils/constants";
import swal from "sweetalert";

export default class TotalBayar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      metodePembayaran: "",
      uangDibayar: "", // input uang yang dibayarkan
    };
  }

  pilihMetode = (metode) => {
    this.setState({ metodePembayaran: metode, uangDibayar: "" });
  };

  handleUangChange = (e) => {
    this.setState({ uangDibayar: e.target.value });
  };

  submitTotalBayar = (totalBayar) => {
    if (!this.state.metodePembayaran) {
      swal({
        title: "Metode Belum Dipilih",
        text: "Silakan pilih metode pembayaran terlebih dahulu.",
        icon: "warning",
        button: "OK",
      });
      return;
    }

    // validasi uang dibayar untuk CASH/TRANSFER
    if (
      (this.state.metodePembayaran === "CASH" ||
        this.state.metodePembayaran === "TRANSFER") &&
      (this.state.uangDibayar === "" ||
        isNaN(this.state.uangDibayar) ||
        parseInt(this.state.uangDibayar) < totalBayar)
    ) {
      swal({
        title: "Uang Tidak Cukup",
        text: "Jumlah uang yang dibayarkan harus valid dan tidak kurang dari total bayar.",
        icon: "error",
        button: "OK",
      });
      return;
    }

    const kembalian =
      this.state.metodePembayaran === "QRIS"
        ? 0
        : parseInt(this.state.uangDibayar) - totalBayar;

    const pesanan = {
      total_bayar: totalBayar,
      menus: this.props.keranjangs,
      tanggal: new Date().toISOString(),
      metode_pembayaran: this.state.metodePembayaran,
      uang_dibayar:
        this.state.metodePembayaran === "QRIS"
          ? totalBayar
          : parseInt(this.state.uangDibayar),
      kembalian: kembalian,
    };

    axios.post(API_URL + "pesanans", pesanan).then(() => {
      this.props.history.push("/Sukses");
    });
  };

  render() {
    const TotalBayar = this.props.keranjangs.reduce(
      (result, item) => result + item.total_harga,
      0
    );

    const kembalian =
      (this.state.metodePembayaran === "CASH" ||
        this.state.metodePembayaran === "TRANSFER") &&
      this.state.uangDibayar
        ? parseInt(this.state.uangDibayar) - TotalBayar
        : 0;

    return (
      <div className="fixed-bottom">
        <Row>
          <Col md={{ span: 3, offset: 9 }} className="px-4">
            <h5>Total Bayar : Rp. {numberWithCommas(TotalBayar)}</h5>

            {/* ✅ Tombol metode pembayaran */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
              <Button
                variant={
                  this.state.metodePembayaran === "CASH"
                    ? "success"
                    : "outline-success"
                }
                onClick={() => this.pilihMetode("CASH")}
              >
                CASH
              </Button>
              <Button
                variant={
                  this.state.metodePembayaran === "QRIS"
                    ? "primary"
                    : "outline-primary"
                }
                onClick={() => this.pilihMetode("QRIS")}
              >
                QRIS
              </Button>
              <Button
                variant={
                  this.state.metodePembayaran === "TRANSFER"
                    ? "warning"
                    : "outline-warning"
                }
                onClick={() => this.pilihMetode("TRANSFER")}
              >
                TRANSFER
              </Button>
            </div>

            {/* ✅ Input uang untuk CASH / TRANSFER */}
            {(this.state.metodePembayaran === "CASH" ||
              this.state.metodePembayaran === "TRANSFER") && (
              <div className="mb-2">
                <Form.Control
                  type="number"
                  placeholder="Masukkan uang dibayar"
                  value={this.state.uangDibayar}
                  onChange={this.handleUangChange}
                />
                <small>
                  Kembalian: Rp.{" "}
                  {kembalian >= 0 ? numberWithCommas(kembalian) : "0"}
                </small>
              </div>
            )}

            <Button
              variant="primary"
              style={{ width: "400px" }}
              onClick={() => this.submitTotalBayar(TotalBayar)}
            >
              <FontAwesomeIcon icon={faShoppingCart} /> Bayar
            </Button>
          </Col>
        </Row>
      </div>
    );
  }
}
