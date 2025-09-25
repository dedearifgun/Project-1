import React, { Component } from "react";
import { Row, Col, Container, Form, Button } from "react-bootstrap";
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
      searchTerm: "",      // ✅ state baru
      searchResult: [],    // ✅ hasil pencarian
    };
  }

  componentDidMount() {
    axios
      .get(API_URL + "product?category.nama=" + this.state.categoriYangDipilih)
      .then((res) => {
        this.setState({ menus: res.data, searchResult: res.data });
      })
      .catch((error) => console.log(error));

    axios
      .get(API_URL + "keranjangs")
      .then((res) => this.setState({ keranjangs: res.data }))
      .catch((error) => console.log(error));
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.keranjangs !== prevState.keranjangs) {
      axios
        .get(API_URL + "keranjangs")
        .then((res) => this.setState({ keranjangs: res.data }))
        .catch((error) => console.log(error));
    }
  }

changeCategory = (value) => {
  this.setState({
    categoriYangDipilih: value,
    menus: [],
  });

  if (value === "Semua") {
    // ✅ ambil semua produk tanpa filter
    axios
      .get(API_URL + "product")
      .then((res) => this.setState({ menus: res.data, searchResult: res.data }))
      .catch((error) => console.log(error));
  } else {
    axios
      .get(API_URL + "product?category.nama=" + value)
      .then((res) => this.setState({ menus: res.data, searchResult: res.data }))
      .catch((error) => console.log(error));
  }
};


  // ✅ pencarian produk
  handleSearch = () => {
    const { menus, searchTerm } = this.state;
    if (!searchTerm) {
      this.setState({ searchResult: menus });
    } else {
      const hasil = menus.filter(
        (m) =>
          m.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.kode.toLowerCase().includes(searchTerm.toLowerCase())
      );
      this.setState({ searchResult: hasil });
    }
  };

  masukkeranjang = (value) => {
    if (!value.stok || value.stok <= 0) {
      swal({
        title: "Gagal",
        text: `${value.nama} stok habis!`,
        icon: "error",
        button: false,
        timer: 1500,
      });
      return;
    }

    axios
      .get(API_URL + "keranjangs?product.id=" + value.id)
      .then((res) => {
        if (res.data.length === 0) {
          const keranjang = {
            jumlah: 1,
            total_harga: value.harga,
            product: value,
          };
          axios.post(API_URL + "keranjangs", keranjang).then(() => {
            swal({
              title: "Sukses!",
              text: `Sukses Masuk Keranjang! ${keranjang.product.nama}`,
              icon: "success",
              button: false,
              timer: 1000,
            });
          });
        } else {
          const keranjang = {
            jumlah: res.data[0].jumlah + 1,
            total_harga: res.data[0].total_harga + value.harga,
            product: value,
          };
          axios
            .put(API_URL + "keranjangs/" + res.data[0].id, keranjang)
            .then(() => {
              swal({
                title: "Sukses!",
                text: `Sukses Tambah ${keranjang.product.nama}`,
                icon: "success",
                button: false,
                timer: 1000,
              });
            });
        }
      })
      .catch((error) => console.log(error));
  };

  render() {
    const { categoriYangDipilih, keranjangs, searchTerm, searchResult } =
      this.state;
    return (
      <div className="mt-3">
        <Container fluid>
          <Row>
            <ListCategory
              changeCategory={this.changeCategory}
              categoriYangDipilih={categoriYangDipilih}
            />
            <Col>
              <div className="d-flex justify-content-between align-items-center">
                <h5>
                  <strong>Daftar Produk</strong>
                </h5>
                {/* ✅ Search Bar */}
                <div className="d-flex gap-2">
                  <Form.Control
                    type="text"
                    placeholder="Cari produk..."
                    value={searchTerm}
                    onChange={(e) => this.setState({ searchTerm: e.target.value })}
                  />
                  <Button variant="primary" onClick={this.handleSearch}>
                    Cari
                  </Button>
                </div>
              </div>
              <hr />
              <Row>
                {searchResult &&
                  searchResult.map((menu) => (
                    <Menus
                      key={menu.id}
                      menu={menu}
                      masukkeranjang={this.masukkeranjang}
                    />
                  ))}
              </Row>
            </Col>
            <Hasil keranjangs={keranjangs} {...this.props} />
          </Row>
        </Container>
      </div>
    );
  }
}
