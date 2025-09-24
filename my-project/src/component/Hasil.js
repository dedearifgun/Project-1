import React, { Component } from 'react'
import { Badge, Col, ListGroup, Row, Button } from 'react-bootstrap'
import { numberWithCommas } from '../utils/utils'
import TotalBayar from './TotalBayar'
import axios from "axios";
import { API_URL } from "../utils/constants";

export default class Hasil extends Component {
  
  tambah = (keranjang) => {
    const keranjangBaru = {
      jumlah: keranjang.jumlah + 1,
      total_harga: keranjang.total_harga + keranjang.product.harga,
      product: keranjang.product
    };

    axios.put(API_URL + "keranjangs/" + keranjang.id, keranjangBaru)
      .then(() => this.props.reloadKeranjang()) // supaya refresh data
      .catch(err => console.error(err));
  }

  kurang = (keranjang) => {
    if (keranjang.jumlah > 1) {
      const keranjangBaru = {
        jumlah: keranjang.jumlah - 1,
        total_harga: keranjang.total_harga - keranjang.product.harga,
        product: keranjang.product
      };

      axios.put(API_URL + "keranjangs/" + keranjang.id, keranjangBaru)
        .then(() => this.props.reloadKeranjang())
        .catch(err => console.error(err));
    } else {
      // kalau jumlah 1 → hapus item
      axios.delete(API_URL + "keranjangs/" + keranjang.id)
        .then(() => this.props.reloadKeranjang())
        .catch(err => console.error(err));
    }
  }

  render() {
    const { keranjangs } = this.props
    return (
      <Col md={3} mt='-1'>
        <h5><strong>Hasil</strong></h5>
        <hr />
        {keranjangs.length !== 0 && (
          <ListGroup variant="flush">
            {keranjangs.map((menuKeranjang) => (
              <ListGroup.Item key={menuKeranjang.id}>
                <Row>
                  <Col xs={2}>
                    <h4>
                      <Badge pill bg="primary">
                        {menuKeranjang.jumlah}
                      </Badge>
                    </h4>
                  </Col>
                  <Col>
                    <h5>{menuKeranjang.product.nama}</h5>
                    <p>Rp.{numberWithCommas(menuKeranjang.product.harga)}</p>
                  </Col>
                  <Col className="ms-auto text-end">
                    <strong>Total : Rp. {numberWithCommas(menuKeranjang.total_harga)}</strong>
                    <div className="mt-2">
                      <Button variant="success" size="sm" onClick={() => this.tambah(menuKeranjang)}>+</Button>{' '}
                      <Button variant="danger" size="sm" onClick={() => this.kurang(menuKeranjang)}>-</Button>
                    </div>
                  </Col>
                </Row>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
        <TotalBayar keranjangs={keranjangs} {...this.props} />
      </Col>
    )
  }
}
