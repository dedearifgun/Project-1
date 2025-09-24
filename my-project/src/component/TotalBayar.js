import React, { Component } from "react";
import { Row, Col, Button } from "react-bootstrap";
import { numberWithCommas } from "../utils/utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingCart } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { API_URL } from "../utils/constants";

export default class TotalBayar extends Component {
    submitTotalBayar=(totalBayar) =>{
            const pesanan={
            total_bayar : totalBayar,
            menus: this.props.keranjangs
        }
        axios.post(API_URL+"pesanans",pesanan).then((res)=>{
            this.props.history.push('/Sukses')
        })
    }
  render() {
    const TotalBayar = this.props.keranjangs.reduce(function (result, item) {
      return result + item.total_harga;
    }, 0);
    return (
      <div className="fixed-bottom">
        <Row>
          <Col md={{ span: 3, offset: 9 }} className="px-4">
            <h5>Total Bayar : Rp. {numberWithCommas(TotalBayar)}</h5>
            <Button variant="primary" style={{ width: "400px" }}
            onClick={ () => this.submitTotalBayar(TotalBayar)}
            >
              <FontAwesomeIcon icon={faShoppingCart} /> Bayar
            </Button>
          
          </Col>
        </Row>
      </div>
    );
  }
}
