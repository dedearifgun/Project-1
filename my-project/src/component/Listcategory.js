import React, { Component } from "react";
import { Col, ListGroup } from "react-bootstrap";
import { API_URL } from "../utils/constants";
import { FaUtensils, FaCoffee, FaCookie } from "react-icons/fa"; // ✅ icon

export default class ListCategories extends Component {
  constructor(props) {
    super(props);
    this.state = {
      categories: []
    };
  }

  componentDidMount() {
    fetch(`${API_URL}/categories`)
      .then((res) => res.json())
      .then((data) => this.setState({ categories: data }))
      .catch((err) => console.error("Error:", err));
  }

  // fungsi untuk pilih icon sesuai nama
  iconForCategory = (nama) => {
    if (nama === "Tas Wanita") return <FaUtensils className="me-2" />;
    if (nama === "Tas Pria") return <FaCoffee className="me-2" />;
    if (nama === "Cemilan") return <FaCookie className="me-2" />;
    return null;
  };

  render() {
    const { categories } = this.state;
    const { changeCategory, kategoriAktif } = this.props;

    return (
      <Col md={3} className="mt-2">
        <h5><strong>Daftar Kategori</strong></h5>
        <hr />
        <ListGroup>
          {categories.map((cat) => (
            <ListGroup.Item
              key={cat.id}
              action
              onClick={() => changeCategory(cat.nama)}
              active={kategoriAktif === cat.nama}
            >
              {this.iconForCategory(cat.nama)} {cat.nama}
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Col>
    );
  }
}
