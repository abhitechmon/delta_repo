import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import axios from "axios";

const useStyles = makeStyles({
  root: {
    width: "100%",
  },
  container: {
    maxHeight: "100vh",
  },
});

export default function WebSocketDemo() {
  const classes = useStyles();
  const [mprice, setMprice] = useState(0);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios.get(`https://api.delta.exchange/v2/products`).then((res) => {
      let result = [];
      for(let [key, value] of Object.entries(res.data.result)) {
        console.log(key + "---" + value)
        result.push(value);
        }
      setProducts(result);
    });
  }, []);

  const ws = new WebSocket("wss://production-esocket.delta.exchange");

  const apiCall = {
    type: "subscribe",
    payload: {
      channels: [
        {
          name: "v2/ticker",
          symbols: ["BTCUSD", "BTCUSDT"],
        },
      ],
    },
  };

  ws.onopen = () => {
    ws.send(JSON.stringify(apiCall));
  };

  ws.onmessage = function (event) {
    const jsonData = JSON.parse(event.data);
    try {
      if (jsonData?.mark_price) {
        setMprice(jsonData.mark_price);
        console.log(jsonData.mark_price);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const listItems = products.map((product) => (
    <TableRow>
      <TableCell align="center">{product.symbol}</TableCell>
      <TableCell align="center">{product.description}</TableCell>
      <TableCell align="center">{product.underlying_asset.symbol}</TableCell>
      <TableCell align="center">{mprice}</TableCell>
    </TableRow>
  ));

  return (
    <Paper className={classes.root}>
      <TableContainer className={classes.container}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              <TableCell align="center">Symbol</TableCell>
              <TableCell align="center">Description</TableCell>
              <TableCell align="center">Underlying Asset</TableCell>
              <TableCell align="center">Mark Price</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {listItems}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
