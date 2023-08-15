import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  Container,
} from "@mui/material";
import productData from "../../productData/products.json";
import inventory from "../../productData/inventory.json";
import AvailabilityWarning from "../AvailabilityWarning/availabilityWarning";

function ProductList({ onAddToCart }) {
  const [products, setProducts] = useState(productData);
  const [quantities, setQuantities] = useState({});
  const [warnings, setWarnings] = useState({});
  const [selectedVariant, setSelectedVariant] = useState({});

  function inventoryValidation(productId, value) {
    const availableQuantity =
      inventory.find((item) => item.product_id === productId)?.quantity || 0;
    const limitPerOrder = inventory.find(
      (item) => item.product_id === productId
    )?.limit_per_purchase;
    if (value > availableQuantity) {
      setWarnings((prevWarnings) => ({
        ...prevWarnings,
        [productId]: `Only ${availableQuantity} available for this product.`,
      }));
      return false;
    } else if (value > limitPerOrder) {
      setWarnings((prevWarnings) => ({
        ...prevWarnings,
        [productId]: `Limited to ${limitPerOrder} per order.`,
      }));
      return false;
    } else {
      setWarnings((prevWarnings) => ({
        ...prevWarnings,
        [productId]: "",
      }));
      return true;
    }
  }

  const handleQuantityChange = (productId, value) => {
    const validationCheck = inventoryValidation(productId, value);
    if (validationCheck) {
      setQuantities((prevQuantities) => ({
        ...prevQuantities,
        [productId]: value,
      }));
    }
  };

  const handlePriceChange = (productId, variantId) => {
    const productToUpdate = products.find(
      (product) => product.id === productId
    );
    const selectedVariant = productToUpdate.variants.find(
      (variant) => variant.id === variantId
    );

    if (selectedVariant) {
      const updatedProducts = products.map((product) => {
        if (product.id === productId) {
          return {
            ...product,
            price: selectedVariant.price,
          };
        }
        return product;
      });

      setProducts(updatedProducts);
      setSelectedVariant(selectedVariant);
    }
  };

  return (
    <Container maxWidth="lg">
      <TableContainer component={Paper}>
        <Table aria-label="Product List">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Image</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="right">Price</TableCell>
              <TableCell align="center">Quantity</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map(
              (product) =>
                product.available && (
                  <TableRow key={product.id}>
                    <TableCell component="th" scope="row">
                      {product.name}
                    </TableCell>
                    <TableCell>
                      <img
                        src={product.image}
                        alt={product.name}
                        style={{ width: "100px", height: "auto" }}
                      />
                    </TableCell>
                    <TableCell>{product.description}</TableCell>
                    <TableCell align="right">
                      ${product.price.toFixed(2)}
                      <div className="variant-block">
                        {product.variants?.map((variant) => (
                          <div key={variant.id}>
                            <Button
                              variant="outlined"
                              color="primary"
                              size="small"
                              onClick={() =>
                                handlePriceChange(product.id, variant.id)
                              }
                            >
                              {variant.name}
                            </Button>
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell align="center">
                      <div>
                        <TextField
                          label="Quantity"
                          type="number"
                          size="small"
                          inputProps={{ min: 1 }}
                          defaultValue={1}
                          onChange={(event) =>
                            handleQuantityChange(product.id, event.target.value)
                          }
                        />
                        {warnings[product.id] && (
                          <AvailabilityWarning
                            warningText={warnings[product.id]}
                          />
                        )}
                      </div>
                    </TableCell>
                    <TableCell align="right">
                      <div>
                        <Button
                          variant="contained"
                          color="primary"
                          className="custom-btn"
                          size="small"
                          disabled={!!warnings[product.id]}
                          onClick={() =>
                            onAddToCart(
                              product,
                              quantities[product.id] || 1,
                              selectedVariant
                            )
                          }
                        >
                          Add to Cart
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}

export default ProductList;
