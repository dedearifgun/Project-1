import React, { Component } from "react";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { Image } from "react-bootstrap";
import axios from "axios";
import { API_URL } from "../utils/constants";

export default class Sukses extends Component {
  componentDidMount() {
    axios
      .get(API_URL + "keranjangs")
      .then((res) => {
        const keranjangs = res.data;
        keranjangs.forEach(item => {
          axios
                  .delete(API_URL+"keranjangs/"+item.id)
                  .then((res)=> console.log(res))
                  .catch((error) => console.log(error))
        });
    
      })
      .catch((error) => {
        console.log(error);
      });
  }
  render() {
    return (
      <div className="mt-4 text-center">
        <Image src="images/sukses.png" width={200}></Image>
        <h2>Sukses</h2>
        <p>Terima Kasih Sudah Memesan !</p>
        <Button variant="primary" as={Link} to="/">
          Kembali
        </Button>
      </div>
    );
  }
}
