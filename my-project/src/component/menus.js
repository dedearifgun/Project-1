import React from 'react'
import {Col, Card} from "react-bootstrap"
import {numberWithCommas} from '../utils/utils'
const Menus = ({menu, masukkeranjang}) => {
  return (
    <Col md={4} xs={6} className='mb-4'>
<Card className="shadow" onClick={()=>masukkeranjang(menu)} style={{ width: '18rem', cursor:'pointer'}}>
      <Card.Img variant="top" src={"images/" + menu.category.nama.toLowerCase()+"/"+menu.gambar} />
      <Card.Body>
        <Card.Title>{menu.nama}({menu.kode})</Card.Title>
        <Card.Text>
        Rp. {numberWithCommas(menu.harga)}
        </Card.Text>
        {/* //<Button variant="primary">Go somewhere</Button> */}
      </Card.Body>
    </Card>
    </Col>
  )
}

export default Menus