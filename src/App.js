import { useEffect, useState } from "react";
import "./App.scss";
import ProductGrid from "./components/ProductGrid/productGrid";
import ProductList from "./components/ProductList/productList";
import {
  Container,
  IconButton,
  ThemeProvider,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import CartSidebar from "./components/CartSideBar/cartSideBar";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { GridOn, ViewList } from "@mui/icons-material";
import theme from "./theme";

function App() {
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [viewType, setViewType] = useState("list");

  const handleViewTypeChange = (event, newViewType) => {
    if (newViewType !== null) {
      setViewType(newViewType);
      localStorage.setItem("product_view", newViewType);
    }
  };

  const toggleCartSidebar = () => {
    setCartOpen(!cartOpen);
  };

  const handleAddToCart = (product, qty, selectedVariant) => {
    const existingCartItem = cartItems.find((item) => {
      return (
        item.id === product.id ||
        (product.variants &&
          product.variants.some((variant) => variant.id === item.id))
      );
    });

    if (existingCartItem) {
      const updatedCartItems = cartItems.map((item) => {
        if (
          item.id === product.id ||
          (product.variants &&
            product.variants.some((variant) => variant.id === item.id))
        ) {
          if (selectedVariant) {
            return {
              ...item,
              price: selectedVariant?.price || item.price,
              quantity: qty,
              variant: selectedVariant,
            };
          } else {
            return { ...item, quantity: qty };
          }
        }
        return item;
      });
      setCartItems(updatedCartItems);
      localStorage.setItem("cart_items", JSON.stringify(updatedCartItems));
    } else {
      const newCartItem = {
        ...product,
        quantity: qty,
        ...(selectedVariant && { variant: selectedVariant }),
        id: selectedVariant?.id || product.id,
      };
      setCartItems([...cartItems, newCartItem]);
      localStorage.setItem(
        "cart_items",
        JSON.stringify([...cartItems, newCartItem])
      );
    }

    setCartOpen(true);
  };

  const onCartQuantityChange = (updatedCartItems) => {
    setCartItems(updatedCartItems);
    localStorage.setItem("cart_items", JSON.stringify(updatedCartItems));
  };

  useEffect(() => {
    const storedCartItems = JSON.parse(
      localStorage.getItem("cart_items") || "[]"
    );
    const storedView = localStorage.getItem("product_view");
    setViewType(storedView);
    setCartItems(storedCartItems);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="lg">
        <div>
          <Typography variant="h4" mb={5} mt={5} align="center">
            Product Catalog with cart
          </Typography>
        </div>
        <div className="view-type">
          <div>
            <ToggleButtonGroup
              value={viewType}
              exclusive
              onChange={handleViewTypeChange}
              aria-label="view type"
            >
              <ToggleButton value="list" aria-label="list view">
                <ViewList />
              </ToggleButton>
              <ToggleButton value="grid" aria-label="grid view">
                <GridOn />
              </ToggleButton>
            </ToggleButtonGroup>
          </div>
          <div>
            <IconButton onClick={toggleCartSidebar}>
              <ShoppingCartIcon />
            </IconButton>
          </div>
        </div>
        {viewType === "grid" ? (
          <ProductGrid onAddToCart={handleAddToCart} />
        ) : (
          <ProductList onAddToCart={handleAddToCart} />
        )}
        <CartSidebar
          open={cartOpen}
          onClose={toggleCartSidebar}
          cartItems={cartItems}
          onCartItemsChange={onCartQuantityChange}
        />
      </Container>
    </ThemeProvider>
  );
}

export default App;
