const pool = require("../db/db");

// get user's cart by username
const getCart = async (req, res, next) => {
	// get username from req params
	const username = req.params.username;
	// get the user id from the request
	const userId = req.user.id;
	// Check the logged-in user is only trying to see their own cart
	if (req.user.username !== username) {
		return res
			.status(403)
			.json({ message: "You can only access your own cart" });
	}
	if (!userId) {
		return res
			.status(403)
			.json({ message: "You need a user ID to view cart" });
	}
	try {
		const result = await pool.query(
			`SELECT 
                products.id AS product_id,
                products.name,
                products.price,
                carts_products.quantity
            FROM carts
            JOIN carts_products ON carts.id = carts_products.cart_id
            JOIN products ON carts_products.product_id = products.id
            WHERE carts.user_id = $1`,
			[userId]
		);
		if (result.rows.length === 0) {
			return res
				.status(404)
				.json({ message: "User not found or cart is empty" });
		}
		res.json(result.rows);
	} catch (error) {
		res.status(500).json({ message: "Error fetching cart", error });
	}
};

// Add to cart
const addToCart = async (req, res, next) => {
	// get username from req params
	const username = req.params.username;
	// get the user id from the request
	const userId = req.user.id;
	// Check the logged-in user is only trying to see their own cart
	if (req.user.username !== username) {
		return res
			.status(403)
			.json({ message: "You can only add to your own cart" });
	}
	if (!userId) {
		return res
			.status(403)
			.json({ message: "You need a user ID to add to cart" });
	}
	const { productName, quantity } = req.body;
	// validate input body
	if (!productName || !quantity || quantity <= 0) {
		return res
			.status(400)
			.json({ message: "Invalid product name or quantity" });
	}
	try {
		// -1. Check that the item exists and get its product ID
		const productResult = await pool.query(
			"SELECT id FROM products WHERE name = $1",
			[productName]
		);
		if (productResult.rows.length === 0) {
			return res.status(404).json({ message: "Product not found" });
		}
		const productId = productResult.rows[0].id;
		// 1. check if user has a cart
		const cartResult = await pool.query(
			"SELECT id FROM carts WHERE user_id = $1",
			[userId]
		);
		// check cart exists
		let cartId;
		if (cartResult.rows.length === 0) {
			// 2. create new cart if one does not yet exist
			const newCart = await pool.query(
				"INSERT INTO carts (user_id) VALUES ($1) RETURNING id",
				[userId]
			);
			cartId = newCart.rows[0].id;
		} else {
			cartId = cartResult.rows[0].id; // otherwise get cart id
		}
		// 3. Insert product into cart
		const addResult = await pool.query(
			`INSERT INTO carts_products (cart_id, product_id, quantity)
            VALUES ($1, $2, $3)
            ON CONFLICT (cart_id, product_id)
            DO UPDATE SET quantity = carts_products.quantity + EXCLUDED.quantity
            RETURNING cart_id, product_id, quantity`,
			[cartId, productId, quantity]
		);
		res.status(200).json(addResult.rows[0]);
	} catch (error) {
		res.status(500).json({ message: "Error adding to cart", error });
	}
};

// update cart item? by item name

// remove cart item by name

// clear cart by username

module.exports = { getCart, addToCart };
