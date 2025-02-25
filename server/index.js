const express = require('express');
const db = require('./db');
const app = express();

app.use(express.json());

app.post('/api/customers', async (req, res, next) => {
  try {
    const result = await db.createCustomer(req.body.name);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

app.get('/api/customers', async (req, res, next) => {
  try {
    const customers = await db.fetchCustomers();
    res.json(customers);
  } catch (err) {
    next(err);
  }
});

app.get('/api/restaurants', async (req, res, next) => {
  try {
    const restaurants = await db.fetchRestaurants();
    res.json(restaurants);
  } catch (err) {
    next(err);
  }
});

app.get('/api/reservations', async (req, res, next) => {
  try {
    const reservations = await db.fetchReservations();
    res.json(reservations);
  } catch (err) {
    next(err);
  }
});

app.post('/api/customers/:id/reservations', async (req, res, next) => {
  try {
    const customerId = req.params.id;
    const { restaurant_id, date, party_count } = req.body;
    const reservation = await db.createReservation(
      customerId,
      restaurant_id,
      date,
      party_count
    );
    res.status(201).json(reservation);
  } catch (err) {
    next(err);
  }
});

app.delete('/api/customers/:customer_id/reservations/:id', async (req, res, next) => {
  try {
    await db.destroyReservation(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message });
});

const init = async () => {
  await db.init();
  app.listen(3000, () => {
    console.log("listening on port 3000");
  });
};

init();
