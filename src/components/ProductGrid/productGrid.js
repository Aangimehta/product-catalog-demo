import React, { useState } from "react";
import {
  Container,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Button,
  TextField,
} from "@mui/material";
import productData from "../../productData/products.json";
import inventory from "../../productData/inventory.json";
import AvailabilityWarning from "../AvailabilityWarning/availabilityWarning";
import "./styles.scss";

function ProductGrid({ onAddToCart }) {
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
    <Container maxWidth="md">
      <Grid container spacing={3}>
        {products.map(
          (product) =>
            product.available && (
              <Grid item xs={12} sm={6} md={4} key={product.id}>
                <Card>
                  <CardMedia
                    component="img"
                    height="150"
                    image={product.image}
                    alt={product.name}
                  />
                  <CardContent>
                    <h3>{product.name}</h3>
                    <p>{product.description}</p>
                    <p>Price: ${product.price.toFixed(2)}</p>
                    <div className="variant-block">
                      {product.variants?.map((variant) => (
                        <div key={variant.id}>
                          <Button
                            variant="outlined"
                            color="primary"
                            onClick={() =>
                              handlePriceChange(product.id, variant.id)
                            }
                          >
                            {variant.name}
                          </Button>
                        </div>
                      ))}
                    </div>
                    <TextField
                      label="Quantity"
                      type="number"
                      size="small"
                      className="qty-grid"
                      inputProps={{ min: 1 }}
                      defaultValue={1}
                      onChange={(event) =>
                        handleQuantityChange(product.id, event.target.value)
                      }
                    />
                    {warnings[product.id] && (
                      <AvailabilityWarning warningText={warnings[product.id]} />
                    )}
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() =>
                        onAddToCart(
                          product,
                          quantities[product.id] || 1,
                          selectedVariant
                        )
                      }
                      style={{ marginTop: "10px" }}
                      disabled={!!warnings[product.id]}
                    >
                      Add to Cart
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            )
        )}
      </Grid>
    </Container>
  );
}

export default ProductGrid;
