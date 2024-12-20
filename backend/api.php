<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

$host = 'localhost';
$username = 'root';
$password = '';
$dbname = 'ramee-react-new';
$conn = new mysqli($host, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Handle GET requests
if (isset($_GET['action'])) {
    if ($_GET['action'] == 'get_suppliers') {
        $sql = "SELECT * FROM suppliers";
        $result = $conn->query($sql);
        $suppliers = [];
        while ($row = $result->fetch_assoc()) {
            $suppliers[] = $row;
        }
        echo json_encode($suppliers);
    } elseif ($_GET['action'] == 'get_products') {
        $sql = "SELECT * FROM products";
        $result = $conn->query($sql);
        $products = [];
        while ($row = $result->fetch_assoc()) {
            // Ensure that price and gstRate are treated as floats and id as integer
            $row['id'] = (int)$row['id'];
            $row['price'] = (float)$row['price'];
            $row['gstRate'] = (float)$row['gstRate'];
            $products[] = $row;
        }
        echo json_encode($products);
    }
}

// Handle POST requests (Order submission)
if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_GET['action']) && $_GET['action'] == 'submit_order') {
    $orderData = json_decode(file_get_contents('php://input'), true);
    $supplierId = (int)$orderData['supplierId']; // Ensure supplierId is an integer
    $orderItems = $orderData['orderItems'];

    // Insert order into orders table
    $sql = "INSERT INTO orders (supplier_id) VALUES ($supplierId)";
    if ($conn->query($sql) === TRUE) {
        $orderId = $conn->insert_id;

        // Insert order items into order_items table
        foreach ($orderItems as $item) {
            $productName = $conn->real_escape_string($item['productName']);
            $price = (float)$item['price']; // Ensure price is a float
            $quantity = (int)$item['quantity']; // Ensure quantity is an integer
            $gstAmount = (float)$item['gstAmount']; // Ensure gstAmount is a float
            $updatedPrice = (float)$item['updatedPrice']; // Ensure updatedPrice is a float

            // Insert each item into the order_items table
            $sql = "INSERT INTO order_items (order_id, product_name, price, quantity, gst_amount, updated_price)
                    VALUES ($orderId, '$productName', $price, $quantity, $gstAmount, $updatedPrice)";
            if (!$conn->query($sql)) {
                echo json_encode(['success' => false, 'message' => 'Error inserting order item: ' . $conn->error]);
                exit;
            }
        }

        echo json_encode(['success' => true, 'message' => 'Order submitted successfully!']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error: ' . $conn->error]);
    }
}

$conn->close();
?>
