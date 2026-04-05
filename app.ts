import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import connectDB from './src/Config/DB.js';
import Product from './src/Model/product.js';
import User from './src/Model/User.js';
import Category from './src/Model/Category.js';
import Order from './src/Model/Order.js';
import Cart from './src/Model/Cart.js';
import Wishlist from './src/Model/Wishlist.js';

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

// Products
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find().populate('category', 'name');
    res.json(products);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Users
app.post('/api/users/register', async (req, res) => {
  try {
    const { name, email, password, address } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'User already exists' });
    const user = new User({ name, email, password, address });
    await user.save();
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '7d' });
    res.status(201).json({ message: 'User created', token, user: { id: user._id, name, email } });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Categories
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/categories', async (req, res) => {
  try {
    const category = new Category(req.body);
    await category.save();
    res.status(201).json(category);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Orders
app.post('/api/orders', async (req, res) => {
  try {
    const order = new Order(req.body);
    await order.save();
    res.status(201).json(order);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/orders/:userId', async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId }).populate('items.productId');
    res.json(orders);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Carts
app.get('/api/carts/:userId', async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.params.userId }).populate('items.productId');
    if (!cart) cart = new Cart({ userId: req.params.userId, items: [] });
    res.json(cart);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/carts/:userId/items', async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    let cart = await Cart.findOne({ userId: req.params.userId });
    if (!cart) cart = new Cart({ userId: req.params.userId });
    
    const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({ productId, quantity });
    }
    await cart.save();
    await cart.populate('items.productId');
    res.json(cart);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/carts/:userId/items/:productId', async (req, res) => {
  try {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ userId: req.params.userId });
    if (!cart) return res.status(404).json({ error: 'Cart not found' });
    
    const itemIndex = cart.items.findIndex(item => item.productId.toString() === req.params.productId);
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity = quantity;
      if (quantity <= 0) cart.items.splice(itemIndex, 1);
    }
    await cart.save();
    await cart.populate('items.productId');
    res.json(cart);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/carts/:userId/items/:productId', async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId });
    if (!cart) return res.status(404).json({ error: 'Cart not found' });
    
    const itemIndex = cart.items.findIndex(item => item.productId.toString() === req.params.productId);
    if (itemIndex > -1) {
      cart.items.splice(itemIndex, 1);
    }
    await cart.save();
    await cart.populate('items.productId');
    res.json(cart);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Wishlists
app.get('/api/wishlists/:userId', async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ userId: req.params.userId }).populate('products');
    if (!wishlist) wishlist = new Wishlist({ userId: req.params.userId, products: [] });
    res.json(wishlist);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/wishlists/:userId/products', async (req, res) => {
  try {
    const { productId } = req.body;
    let wishlist = await Wishlist.findOne({ userId: req.params.userId });
    if (!wishlist) wishlist = new Wishlist({ userId: req.params.userId });
    
    if (!wishlist.products.some(p => p.toString() === productId)) {
      wishlist.products.push(productId);
      await wishlist.save();
    }
    await wishlist.populate('products');
    res.json(wishlist);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/wishlists/:userId/products/:productId', async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ userId: req.params.userId });
    if (!wishlist) return res.status(404).json({ error: 'Wishlist not found' });
    
    wishlist.products = wishlist.products.filter(p => p.toString() !== req.params.productId);
    await wishlist.save();
    await wishlist.populate('products');
    res.json(wishlist);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export const viteNodeApp = app;
export default app;
