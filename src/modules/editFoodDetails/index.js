import React, { useEffect, useState } from "react";
import { InputNumber, Input, Table, Button, Layout } from "antd";
import "antd/dist/antd.css";
import client from "api/http-client";
import { languages } from "config";

const ProductContainer = props => {
  const [products, setProducts] = useState([]);

  const fetchProducts = () => {
    client.get("/product").then(({ data = [] }) =>
      setProducts(
        data.map(({ name, unitPrice }, index) => ({
          name: {
            [languages[0].code]: name[0],
            [languages[1].code]: name[1],
            [languages[2].code]: name[2]
          },
          unitPrice,
          no: index
        }))
      )
    );
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleUpdateProduct = product => {
    if (products.find(p => `${p.no}` === `${product.no}`).isNew) {
      client.post(`/product`, product).then(() => fetchProducts());
      return;
    }
    client.put(`/product/${product.no}`, product).then(() => fetchProducts());
  };

  const handleDeleteProduct = product => {
    client.delete(`/product/${product.no}`).then(() => fetchProducts());
  };

  const handleNewProduct = initalNewProduct => {
    setProducts(oldProducts => {
      return [...oldProducts, initalNewProduct];
    });
  };

  return (
    <Products
      {...props}
      data={products}
      handleUpdateProduct={handleUpdateProduct}
      handleDeleteProduct={handleDeleteProduct}
      handleNewProduct={handleNewProduct}
    />
  );
};

class Products extends React.Component {
  state = {};

  handleSelectRow = record => {
    const oldRowState = this.state[record.no] || {};
    this.setState({
      [record.no]: {
        ...oldRowState,
        editing: true,
        name: record.name,
        unitPrice: record.unitPrice | 0
      }
    });
  };

  handleDeSelectRow = no => {
    const oldRowState = this.state[no] || {};
    this.setState({
      [no]: {
        ...oldRowState,
        editing: false
      }
    });
  };

  handleChange = (no, key, value) => {
    const oldRowState = this.state[no] || {};
    this.setState({
      [no]: {
        ...oldRowState,
        [key]: value
      }
    });
  };

  handleChangeName = (no, key, value) => {
    const oldRowState = this.state[no] || {};
    this.setState({
      [no]: {
        ...oldRowState,
        name: {
          ...oldRowState.name,
          [key]: value
        }
      }
    });
  };

  columns = [
    {
      title: "Product Name",
      dataIndex: "name[r]",
      key: "name[r]",
      render: (text, record) => {
        const rowState = this.state[record.no];
        const editing = rowState && rowState.editing;
        if (!editing) return text;
        return (
          <>
            <Input
              onChange={e => {
                this.handleChangeName(record.no, "r", e.target.value);
              }}
              value={rowState.name.r}
              style={{
                width: 100
              }}
            />
          </>
        );
      }
    },
    {
      title: "Product Name",
      dataIndex: "name[c]",
      key: "name[c]",
      render: (text, record) => {
        const rowState = this.state[record.no];
        const editing = rowState && rowState.editing;
        if (!editing) return text;
        return (
          <>
            <Input
              onChange={e => {
                this.handleChangeName(record.no, "c", e.target.value);
              }}
              value={rowState.name.c}
              style={{
                width: 100
              }}
            />
          </>
        );
      }
    },
    {
      title: "Product Name",
      dataIndex: "name[k]",
      key: "name[k]",
      render: (text, record) => {
        const rowState = this.state[record.no];
        const editing = rowState && rowState.editing;
        if (!editing) return text;
        return (
          <>
            <Input
              onChange={e => {
                this.handleChangeName(record.no, "k", e.target.value);
              }}
              value={rowState.name.k}
              style={{
                width: 100
              }}
            />
          </>
        );
      }
    },
    {
      title: "Unit Price",
      dataIndex: "unitPrice",
      key: "unitPrice",
      render: (text, record) => {
        const rowState = this.state[record.no];
        const editing = rowState && rowState.editing;
        if (!editing) {
          if (rowState && !rowState.unitPrice) {
            return null;
          }
          return text;
        }
        return (
          <>
            <InputNumber
              onChange={value => {
                this.handleChange(record.no, "unitPrice", value);
              }}
              value={rowState.unitPrice}
              min={0}
              style={{
                width: 100
              }}
            />
          </>
        );
      }
    },
    {
      title: "Edit",
      dataIndex: "edit",
      key: "edit",
      align: "center",
      render: (text, record) => {
        const rowState = this.state[record.no];
        if (rowState && rowState.editing) {
          return (
            <Button
              icon="check"
              onClick={() => {
                this.props.handleUpdateProduct({
                  no: record.no,
                  productName: Object.values(rowState.name),
                  unitPrice: rowState.unitPrice
                });
                this.handleDeSelectRow(record.no);
              }}
            />
          );
        }
        return (
          <Button icon="edit" onClick={() => this.handleSelectRow(record)} />
        );
      }
    },
    {
      title: "Remove",
      dataIndex: "remove",
      key: "remove",
      align: "center",
      render: (text, record) => {
        return (
          <Button
            icon="delete"
            onClick={() => this.props.handleDeleteProduct(record)}
          />
        );
      }
    }
  ];

  getTotal = () => {
    return Object.keys(this.state).reduce((acc, key) => {
      const rowState = this.state[key];
      if (rowState && rowState.selected) {
        return acc + rowState.price || 0;
      }
      return acc;
    }, 0);
  };

  render() {
    return (
      <Layout id="order-detail" style={{ marginTop: 12 }}>
        <Layout.Content
          style={{ background: "#fff", padding: 8, marginRight: 12 }}
        >
          <Table
            rowKey={record => record.no}
            className="table"
            style={{
              width: "100%",
              background: "#fff",
              padding: 8,
              overflowX: "auto"
            }}
            columns={this.columns}
            dataSource={this.props.data}
            rowClassName={record => {
              const rowState = this.state[record.no];
              return rowState && rowState.selected ? "selected" : "";
            }}
            pagination={false}
          />
        </Layout.Content>
        <Layout.Sider
          style={{
            background: "#fff",
            padding: "24px 8px",
            height: "fit-content"
          }}
          width={200}
        >
          <Button
            onClick={() => {
              const initalNewProduct = {
                no: this.props.data.length,
                name: languages.reduce((acc, l) => {
                  acc[l.code] = "";
                  return acc;
                }, {}),
                unitPrice: 1,
                isNew: true
              };
              this.props.handleNewProduct(initalNewProduct);
              this.handleSelectRow(initalNewProduct);
            }}
            className="button"
          >
            New Product
          </Button>
        </Layout.Sider>
      </Layout>
    );
  }
}

export default ProductContainer;
