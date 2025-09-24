import React, { Component } from "react";
import { Row, Col, Container } from "react-bootstrap";
import { Hasil, ListCategory, Menus } from "../component";
import { API_URL } from "../utils/constants";
import axios from "axios";
import swal from "sweetalert";

export default class Home extends Component {
  constructor(props) {
    super(props);

    this.state = {
      menus: [],
      categoriYangDipilih: "Makanan",
      keranjangs: [],
    };
  }

  componentDidMount() {
    axios
      .get(API_URL + "product?category.nama=" + this.state.categoriYangDipilih)
      .then((res) => {
        this.setState({ menus: res.data });
      })
      .catch((error) => console.log(error));

    this.reloadKeranjang();
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.keranjangs !== prevState.keranjangs) {
      this.reloadKeranjang();
    }
  }

  reloadKeranjang = () => {
    axios
      .get(API_URL + "keranjangs")
      .then((res) => this.setState({ keranjangs: res.data }))
      .catch((error) => console.log(error));
  };

  changeCategory = (value) => {
    this.setState({ categoriYangDipilih: value, menus: [] });
    axios
      .get(API_URL + "product?category.nama=" + value)
      .then((res) => this.setState({ menus: res.data }))
      .catch((error) => console.log(error));
  };

  masukkeranjang = (value) => {
    // Ambil stok terbaru dari database sebelum proses
    axios.get(API_URL + "product/" + value.id).then((resProduk) => {
      const produkTerbaru = resProduk.data;

      if (produkTerbaru.stok <= 0) {
        swal({
          title: "Gagal!",
          text: "Stok " + produkTerbaru.nama + " habis.",
          icon: "error",
          button: false,
          timer: 1500,
        });
        return;
      }

      // Cek apakah produk sudah ada di keranjang
      axios.get(API_URL + "keranjangs?product.id=" + value.id).then((res) => {
        if (res.data.length === 0) {
          // Belum ada di keranjang
          const keranjang = {
            jumlah: 1,
            total_harga: produkTerbaru.harga,
            product: produkTerbaru,
          };

          axios.post(API_URL + "keranjangs", keranjang).then(() => {
            // Update stok sesuai jumlah baru
            axios.put(API_URL + "product/" + produkTerbaru.id, {
              ...produkTerbaru,
              stok: produkTerbaru.stok - keranjang.jumlah,
            });

            swal({
              title: "Sukses!",
              text: "Sukses Masuk Keranjang! " + produkTerbaru.nama,
              icon: "success",
              button: false,
              timer: 1000,
            });
            this.reloadKeranjang();
          });
        } else {
          // Sudah ada di keranjang
          const keranjangLama = res.data[0];
          const keranjangBaru = {
            jumlah: keranjangLama.jumlah + 1,
            total_harga: keranjangLama.total_harga + produkTerbaru.harga,
            product: produkTerbaru,
          };

          axios.put(API_URL + "keranjangs/" + keranjangLama.id, keranjangBaru).then(() => {
            // Hitung selisih jumlah baru - jumlah lama
            const selisih = keranjangBaru.jumlah - keranjangLama.jumlah;

            // Ambil stok terbaru lagi sebelum update
            axios.get(API_URL + "product/" + value.id).then((resProduk2) => {
              const produkTerupdate = resProduk2.data;
              axios.put(API_URL + "product/" + produkTerupdate.id, {
                ...produkTerupdate,
                stok: produkTerupdate.stok - selisih,
              });
            });

            swal({
              title: "Sukses!",
              text: "Sukses Masuk Keranjang! " + produkTerbaru.nama,
              icon: "success",
              button: false,
              timer: 1000,
            });
            this.reloadKeranjang();
          });
        }
      });
    });
  };

  render() {
    const { menus, categoriYangDipilih, keranjangs } = this.state;
    return (
      <div className="mt-3">
        <Container fluid>
          <Row>
            <ListCategory
              changeCategory={this.changeCategory}
              categoriYangDipilih={categoriYangDipilih}
            />
            <Col>
              <h5><strong>Daftar Produk</strong></h5>
              <hr />
              <Row>
                {menus &&
                  menus.map((menu) => (
                    <Menus
                      key={menu.id}
                      menu={menu}
                      masukkeranjang={this.masukkeranjang}
                    />
                  ))}
              </Row>
            </Col>
            <Hasil
              keranjangs={keranjangs}
              reloadKeranjang={this.reloadKeranjang}
              {...this.props}
            />
          </Row>
        </Container>
      </div>
    );
  }
}
