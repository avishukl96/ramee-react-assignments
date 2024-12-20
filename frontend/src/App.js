import React, { useState, useEffect } from "react";

// App Component
const App = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch suppliers and products from API
  useEffect(() => {
    // Fetch suppliers
    fetch(
      "http://localhost/ramee-react-assignments/backend/api.php?action=get_suppliers"
    )
      .then((res) => res.json())
      .then((data) => setSuppliers(data))
      .catch(() => setError("Error fetching suppliers"));

    // Fetch products
    fetch(
      "http://localhost/ramee-react-assignments/backend/api.php?action=get_products"
    )
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch(() => setError("Error fetching products"))
      .finally(() => setLoading(false));
  }, []);

  // Add selected product to order
  const addProductToOrder = () => {
    if (!selectedProduct || quantity <= 0) {
      setError("Please select a valid product and quantity.");
      return;
    }

    const selectedProductId = Number(selectedProduct);
    const product = products.find((p) => p.id === selectedProductId);

    if (!product) {
      setError("Product not found");
      return;
    }

    if (!selectedSupplier) {
      setError("Please select a valid suppliers");
      return;
    }

    const selectedSupplierId = Number(selectedSupplier);

    //const supplier = suppliers.find((s) => s.id === selectedSupplierId);

    const supplier = suppliers.find(
      (s) => String(s.id) === String(selectedSupplierId) // Ensure the ID is treated as a string
    );
    console.log(selectedSupplierId);
    if (!supplier) {
      setError("Supplier not found");
      return;
    }

    const totalPrice = product.price * quantity;
    const gstAmount = (product.gstRate / 100) * totalPrice;
    const updatedPrice = totalPrice + gstAmount;

    setOrderItems([
      ...orderItems,
      {
        supplierName: supplier.name,
        productName: product.name,
        price: product.price,
        gstRate: product.gstRate,
        gstAmount,
        quantity,
        updatedPrice,
      },
    ]);
    setError(""); // Clear error message
  };

  // Calculate Grand Total
  const calculateGrandTotal = () => {
    return orderItems
      .reduce((total, item) => total + item.updatedPrice, 0)
      .toFixed(2);
  };

  // Submit order to API
  const submitOrder = () => {
    if (!selectedSupplier || orderItems.length === 0) {
      setError("Please select a supplier and add products to the order.");
      return;
    }

    const orderData = {
      supplierId: selectedSupplier,
      orderItems,
    };

    fetch(
      "http://localhost/ramee-react-assignments/backend/api.php?action=submit_order",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      }
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          alert("Order Submitted Successfully");
          setOrderItems([]);
          setSelectedSupplier("");
          setSelectedProduct("");
          setQuantity(1);
        } else {
          setError("Error submitting order");
        }
      })
      .catch(() => setError("Error submitting order"));
  };

  // Handle product selection or quantity change and add product to order
  const handleProductSelection = () => {
    // Trigger adding the product when dropdown changes
    addProductToOrder();
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#f4f4f4",
      }}
    >
      <div
        style={{
          backgroundColor: "#fff",
          padding: "30px",
          borderRadius: "8px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
          width: "60%",
          maxWidth: "800px",
          textAlign: "center",
        }}
      >
        <h1 style={{ color: "#007BFF" }}>Purchase Order</h1>

        {loading && <div>Loading data...</div>}
        {error && (
          <div style={{ color: "red", marginBottom: "20px" }}>{error}</div>
        )}

        {/* Top 4 elements in a row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "20px",
            gap: "20px",
          }}
        >
          {/* Supplier Selection */}
          <div style={{ flex: "1" }}>
            <label>Supplier:</label>
            <select
              value={selectedSupplier}
              onChange={(e) => setSelectedSupplier(e.target.value)}
              style={{
                padding: "8px",
                width: "100%",
                borderRadius: "4px",
                border: "1px solid #ddd",
                marginBottom: "10px",
              }}
            >
              <option value="">Select Supplier</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Product Selection */}
          <div style={{ flex: "1" }}>
            <label>Product:</label>
            <select
              value={selectedProduct}
              onChange={(e) => {
                setSelectedProduct(e.target.value);
                //handleProductSelection(); // Trigger adding product on change
              }}
              style={{
                padding: "8px",
                width: "100%",
                borderRadius: "4px",
                border: "1px solid #ddd",
                marginBottom: "10px",
              }}
            >
              <option value="">Select Product</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Quantity Input */}
          <div style={{ flex: "1" }}>
            <label>Quantity:</label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              style={{
                padding: "8px",
                width: "100%",
                borderRadius: "4px",
                border: "1px solid #ddd",
                marginBottom: "10px",
              }}
            />
          </div>

          {/* Add Product Button */}
          <div style={{ flex: "1" }}>
            <button
              onClick={addProductToOrder} // Trigger adding product on button click
              style={{
                padding: "10px 20px",
                backgroundColor: "#28a745",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                width: "100%",
                cursor: "pointer",
              }}
            >
              Add Product to Order
            </button>
          </div>
        </div>

        {/* Order Table */}
        <table
          border="1"
          style={{
            marginTop: "20px",
            width: "100%",
            borderCollapse: "collapse",
            textAlign: "left",
            marginBottom: "20px",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#007BFF", color: "#fff" }}>
              <th>Supplier Name</th>
              <th>Product Name</th>
              <th>Price</th>
              <th>GST Rate (%)</th>
              <th>GST Amount</th>
              <th>Updated Price</th>
            </tr>
          </thead>
          <tbody>
            {orderItems.map((item, index) => (
              <tr key={index}>
                <td>{item.supplierName}</td>
                <td>{item.productName}</td>
                <td>{item.price}</td>
                <td>{item.gstRate}</td>
                <td>{item.gstAmount.toFixed(2)}</td>
                <td>{item.updatedPrice.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Grand Total */}
        <div
          style={{ marginBottom: "20px", fontSize: "18px", fontWeight: "bold" }}
        >
          <strong>Grand Total: </strong> {calculateGrandTotal()}
        </div>

        {/* Submit Order Button */}
        <button
          onClick={submitOrder}
          style={{
            padding: "10px 20px",
            backgroundColor: "#007BFF",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            width: "100%",
          }}
        >
          Submit Order
        </button>
      </div>
    </div>
  );
};

export default App;
