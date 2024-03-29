import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import {
  InputNumber,
  Input,
  Select,
  Table,
  Typography,
  Button,
  Layout,
  Icon
} from "antd";
import "antd/dist/antd.css";
import client from "api/http-client";
import "./product.scss";
import { languages } from "config";
const { Search } = Input;

const { Option } = Select;

const { Text } = Typography;

let defaultProducts = [];

const ProductContainer = props => {
  const [products, setProducts] = useState([]);
  const [language, setLanguage] = useState(languages[0].code);
  const history = useHistory();

  useEffect(() => {
    client.get("/product").then(({ data = [] }) => {
      defaultProducts = data.map(({ name, unitPrice }, index) => ({
        name: {
          [languages[0].code]: name[0],
          [languages[1].code]: name[1],
          [languages[2].code]: name[2]
        },
        unitPrice,
        no: index
      }));

      setProducts(defaultProducts);
    });
    return () => (defaultProducts = []);
  }, []);

  const handleShowCart = cart => {
    localStorage.setItem("cart", JSON.stringify(cart));
    history.push("/cart");
  };

  const handleFilter = text => {
    setProducts(oldProducts => {
      if (text === "") return defaultProducts;
      return oldProducts.filter(p => p.name[language].includes(text));
    });
  };

  return (
    <Products
      {...props}
      data={products}
      handleShowCart={handleShowCart}
      handleFilter={handleFilter}
      language={language}
      setLanguage={setLanguage}
    />
  );
};

class Products extends React.Component {
  state = {};

  handleSelectRow = (no, record) => {
    const oldRowState = this.state[no] || {};
    this.setState({
      [no]: {
        ...oldRowState,
        selected: true,
        value: oldRowState.value || 1,
        price: oldRowState.price || record.unitPrice
      }
    });
  };

  handleDeSelectRow = no => {
    const oldRowState = this.state[no] || {};
    this.setState({
      [no]: {
        ...oldRowState,
        selected: false
      }
    });
  };
  handleChangeAmount = (no, value, record) => {
    const oldRowState = this.state[no] || {};
    this.setState({
      [no]: {
        ...oldRowState,
        value,
        price: record.unitPrice * value
      }
    });
  };

  getColumn =() => [
    {
      title: "Product Name",
      dataIndex: `name[${this.props.language}]`,
      key: `name[${this.props.language}]`,
    },
    {
      title: "Unit Price",
      dataIndex: "unitPrice",
      key: "unitPrice"
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (text, record) => {
        const rowState = this.state[record.no];
        const isSelected = rowState && rowState.selected;
        if (!isSelected) return null;
        return (
          <>
            <InputNumber
              onClick={e => {
                e.stopPropagation();
              }}
              onChange={value => {
                this.handleChangeAmount(record.no, value, record);
              }}
              min={1}
              value={(rowState && rowState.value) || 0}
              style={{
                width: 100
              }}
            />
            <Icon
              style={{
                marginLeft: 8,
                color: "gray"
              }}
              type="delete"
              onClick={e => {
                e.stopPropagation();
                this.handleDeSelectRow(record.no);
              }}
            />
          </>
        );
      }
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (text, record) => {
        const rowState = this.state[record.no];
        return rowState && rowState.selected && rowState.price;
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

  toOrderDetail = () => {
    const products = Object.keys(this.state).map(key => {
      const productState = this.state[key];

      return {
        ...this.props.data.find(record => `${record.no}` === key),
        ...productState
      };
    });
    return {
      products,
      total: this.getTotal()
    };
  };

  isEmptyCart = () => {
    const selected = Object.keys(this.state)
      .map(key => this.state[key])
      .filter(row => row.selected);
    return selected.length === 0;
  };

  render() {
    return (
      <>
        <div>
          <Search
            className="search"
            enterButton="Search"
            size="large"
            style={{ width: 500 }}
            onSearch={this.props.handleFilter}
          />
          <Select
            className="select"
            defaultValue={languages[0].code}
            style={{ width: 200 }}
            onChange={this.props.setLanguage}
          >
            {languages.map(({ code, label }) => (
              <Option key={code} value={code}>
                {label}
              </Option>
            ))}
            
          </Select>
        </div>
        <Layout id="order-detail" style={{ marginTop: 12 }}>
          <Layout.Content
            style={{ background: "#fff", padding: 8, marginRight: 12 }}
          >
            <Table
              rowKey={record => record.no}
              className="table"
              style={{ padding: 8 }}
              columns={this.getColumn()}
              dataSource={this.props.data}
              pagination={false}
              rowClassName={record => {
                const rowState = this.state[record.no];
                return rowState && rowState.selected ? "selected" : "";
              }}
              onRow={record => {
                return {
                  onClick: () => {
                    this.handleSelectRow(record.no, record);
                  }
                };
              }}
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
            <div style={{ marginTop: 15 }}>
              <Text style={{ fontSize: 16 }}>Total Price: </Text>
              <Input
                value={this.getTotal()}
                style={{ width: 120, marginLeft: 10 }}
              />
            </div>
            <Button
              onClick={() => {
                if (!this.isEmptyCart()) {
                  const cart = this.toOrderDetail();
                  this.props.handleShowCart(cart);
                }
              }}
              className="button"
            >
              View Cart
            </Button>
          </Layout.Sider>
        </Layout>
      </>
    );
  }
}

export default ProductContainer;
