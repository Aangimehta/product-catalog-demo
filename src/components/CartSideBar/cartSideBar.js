import React, { useEffect, useState } from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
  Button,
  OutlinedInput,
  InputAdornment,
  Card,
  CardContent,
  Typography,
  TextField,
} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import inventory from "../../productData/inventory.json";
import AvailabilityWarning from "../AvailabilityWarning/availabilityWarning";
import couponsData from "../../productData/coupons.json";
import "./styles.scss";

const CartSidebar = ({ open, onClose, cartItems, onCartItemsChange }) => {
  const [localCartItems, setLocalCartItems] = useState(null);
  const [warnings, setWarnings] = useState({});
  const [couponCode, setCouponCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [couponError, setCouponError] = useState(null);
  const [couponSuccessMsg, setCouponSuccessMsg] = useState(null);

  const inventoryValidation = (itemId, newQuantity) => {
    const availableQuantity =
      inventory.find((item) => item.product_id === itemId)?.quantity || 0;
    const limitPerOrder = inventory.find(
      (item) => item.product_id === itemId
    )?.limit_per_purchase;
    if (newQuantity > availableQuantity) {
      setWarnings((prevWarnings) => ({
        ...prevWarnings,
        [itemId]: `Only ${availableQuantity} available for this product.`,
      }));
      return false;
    } else if (newQuantity > limitPerOrder) {
      setWarnings((prevWarnings) => ({
        ...prevWarnings,
        [itemId]: `Limited to ${limitPerOrder} per order.`,
      }));
      return false;
    } else {
      setWarnings((prevWarnings) => ({
        ...prevWarnings,
        [itemId]: "",
      }));
      return true;
    }
  };
  const handleQuantityChange = (itemId, newQuantity) => {
    const validation = inventoryValidation(itemId, newQuantity);
    if (validation) {
      if (newQuantity < 1) {
        const updatedCartItems = localCartItems.filter(
          (item) => item.id !== itemId
        );
        setLocalCartItems(updatedCartItems);
        onCartItemsChange(updatedCartItems);
        localStorage.setItem("cart_items", JSON.stringify(updatedCartItems));
      } else {
        const updatedCartItems = localCartItems.map((item) =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        );
        setLocalCartItems(updatedCartItems);
        onCartItemsChange(updatedCartItems);
        localStorage.setItem("cart_items", JSON.stringify(updatedCartItems));
      }
    }
  };

  const applyCoupon = () => {
    setCouponError(null);
    setCouponSuccessMsg(null);
    const coupon = couponsData.find((coupon) => coupon.code === couponCode);
    if (coupon) {
      setAppliedDiscount(coupon.discount);
      setCouponSuccessMsg("Coupon applied!");
    } else {
      setAppliedDiscount(0);
      setCouponError("Invalid coupon");
    }
  };

  const calculateTotal = () => {
    const subtotal = cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    const total = appliedDiscount
      ? subtotal - (subtotal * appliedDiscount) / 100
      : subtotal;
    return total;
  };

  useEffect(() => {
    setLocalCartItems(cartItems);
  }, [cartItems]);
  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <List>
        <ListItem>
          <ListItemText primary="Shopping Cart" />
          <IconButton onClick={onClose}>
            <ShoppingCartIcon />
          </IconButton>
        </ListItem>
      </List>
      <Divider />
      <List>
        {localCartItems &&
          localCartItems.map((item) => (
            <>
              <ListItem key={`cart-${item.id}`}>
                <ListItemText
                  primary={item.name}
                  secondary={`$${item.price}`}
                />

                <OutlinedInput
                  type="number"
                  size="small"
                  className="qty-plus-minus"
                  min={1}
                  value={item.quantity}
                  onChange={(event) =>
                    handleQuantityChange(item.id, event.target.value)
                  }
                  startAdornment={
                    <InputAdornment position="start">
                      <Button
                        variant="outlined"
                        color="primary"
                        size="small"
                        onClick={() =>
                          handleQuantityChange(item.id, item.quantity - 1)
                        }
                      >
                        -
                      </Button>
                    </InputAdornment>
                  }
                  endAdornment={
                    <InputAdornment position="end">
                      <Button
                        variant="outlined"
                        color="primary"
                        size="small"
                        disabled={!!warnings[item.id]}
                        onClick={() =>
                          handleQuantityChange(item.id, item.quantity + 1)
                        }
                      >
                        +
                      </Button>
                    </InputAdornment>
                  }
                />
              </ListItem>
              {warnings[item.id] && (
                <AvailabilityWarning warningText={warnings[item.id]} />
              )}
            </>
          ))}
      </List>
      {cartItems.length > 0 ? (
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6">Total</Typography>
            <Typography variant="body1">
              Items in Cart: {cartItems.length}
            </Typography>
            <Typography variant="body1">
              Total Price: ${calculateTotal().toFixed(2)}
            </Typography>

            <div className="coupon-code">
              <div className="coupon-block">
                <TextField
                  label="Coupon Code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                />
              </div>
              <Button
                variant="outlined"
                color="primary"
                onClick={applyCoupon}
                disabled={!couponCode}
              >
                Apply Discount
              </Button>
            </div>
            {couponError && (
              <Typography color="error">{couponError}</Typography>
            )}
            {couponSuccessMsg && (
              <Typography color="success">{couponSuccessMsg}</Typography>
            )}

            <Button
              variant="contained"
              className="checkout-btn"
              color="primary"
              fullWidth
            >
              Checkout
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Typography align="center">Cart is empty!</Typography>
      )}
    </Drawer>
  );
};

export default CartSidebar;
