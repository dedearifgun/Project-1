// //import './App.css';
// import React, { Component } from "react";
// //import React from 'react';
// //import NavbarComp from './component/NavbarComp';
// import { Row, Col, Container } from "react-bootstrap";
// //import ListCategory from './component/ListCategory'
// //import Hasil from './component/Hasil';
// import { Hasil, ListCategory, Menus, NavbarComp } from "./component";
// import { API_URL } from "./utils/constants";
// import axios from "axios";
// import swal from "sweetalert";

// export default class App extends Component {
//   constructor(props) {
//     super(props);

//     this.state = {
//       menus: [],
//       categoriYangDipilih: "Makanan",
//       keranjangs :[],
//     };
//   }
//   componentDidMount() {
//     axios
//       .get(API_URL + "product?category.nama=" + this.state.categoriYangDipilih)
//       .then((res) => {
//         const menus = res.data;
//         this.setState({ menus });
//       })
//       .catch((error) => {
//         console.log(error);
//       });
//       axios
//       .get(API_URL + "keranjangs")
//       .then((res) => {
//         const keranjangs = res.data;
//         this.setState({ keranjangs });
//       })
//       .catch((error) => {
//         console.log(error);
//       });

//   }
//   componentDidUpdate(prevState){
//     if(this.state.keranjangs!==prevState.keranjangs)
//       axios
//       .get(API_URL + "keranjangs")
//       .then((res) => {
//         const keranjangs = res.data;
//         this.setState({ keranjangs });
//       })
//       .catch((error) => {
//         console.log(error);
//       });
//   }
//   changeCategory = (value) => {
//     this.setState({
//       categoriYangDipilih: value,
//       menus: [],
//     });
//     axios
//       .get(API_URL + "product?category.nama=" + value)
//       .then((res) => {
//         const menus = res.data;
//         this.setState({ menus });
//       })
//       .catch((error) => {
//         console.log(error);
//       });
//   };
//   masukkeranjang = (value) =>{
//  axios
//       .get(API_URL + "keranjangs?product.id=" + value.id)
//       .then((res) => {
//       if (res.data.length===0){
//       const keranjang ={
//       jumlah : 1,
//       total_harga : value.harga,
//       product:value
//     }
//     axios
//       .post(API_URL + "keranjangs",keranjang)
//       .then((res) => {
//         swal({
//           title: "Sukses !",
//            text: "Sukses Masuk Keranjang!"+keranjang.product.nama,
//            icon: "success",
//             button: false,
//             timer:1000,
// });
//       })
//       .catch((error) => {
//         console.log(error);
//       });
//         }else {
//       const keranjang ={
//       jumlah : res.data[0].jumlah+1,
//       total_harga : res.data[0].total_harga+value.harga,
//       product:value,
//     };
//     axios
//       .put(API_URL + "keranjangs/"+res.data[0].id,keranjang)
//       .then((res) => {
//         swal({
//           title: "Sukses !",
//            text: "Sukses Masuk Keranjang!"+keranjang.product.nama,
//            icon: "success",
//             button: false,
//              timer:1000,
// });
//       })
//       .catch((error) => {
//         console.log(error);
//       });

//         }
//       })
//       .catch((error) => {
//         console.log(error);
//       });
   
//   }



//   render() {
//     //console.log(this.state.menus);
//     const { menus, categoriYangDipilih,keranjangs } = this.state;
//     return (
//       <div className="App">
//         <NavbarComp />
//         <div className="mt-3">
//           <Container fluid>
//             <Row>
//               <ListCategory
//                 changeCategory={this.changeCategory}
//                 categoriYangDipilih={categoriYangDipilih}
//               />
//               <Col>
//                 <h5>
//                   <strong>Daftar Produk</strong>
//                 </h5>
//                 <hr />
//                 <Row>
//                   {menus &&
//                     menus.map((menu) => (
//                       //<h5>{menu.nama}</h5>
//                       <Menus 
//                       key={menu.id} 
//                       menu={menu} 
//                       masukkeranjang ={this.masukkeranjang}
//                       />
//                     ))}
//                 </Row>
//               </Col>
//               <Hasil keranjangs={keranjangs}/>
//             </Row>
//           </Container>
//         </div>
//       </div>
//     )
//   }
// }
import React from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import { NavbarComp } from "./component";
import {Home} from "./pages";
import { Sukses } from './pages';


function App() {
  return (
    <BrowserRouter>
      <NavbarComp />
    <main>
    <Switch>
      <Route path="/" component={Home} exact/>
      <Route path="/Sukses" component={Sukses} exact/>
    </Switch>
  </main>
    </BrowserRouter>
  );
}
export default App;