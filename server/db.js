// server/db.js
const pg = require('pg');
const uuid = require('uuid');

const client = new pg.Client('postgres://kseniia:kseniya3@localhost:5432/acme_dining_db');

const createTables = async () => {
  const SQL = `
    DROP TABLE IF EXISTS reservations;
    DROP TABLE IF EXISTS customers;
    DROP TABLE IF EXISTS restaurants;
    
    CREATE TABLE restaurants(
      id UUID PRIMARY KEY,
      name VARCHAR(50) NOT NULL
    ); 
    
    CREATE TABLE customers(
      id UUID PRIMARY KEY,
      name VARCHAR(50) NOT NULL
    );
    
    CREATE TABLE reservations(
      id UUID PRIMARY KEY,
      date DATE NOT NULL,
      party_count INTEGER NOT NULL,
      restaurant_id UUID REFERENCES restaurants(id) NOT NULL,
      customer_id UUID REFERENCES customers(id) NOT NULL
    );
  `;
  await client.query(SQL);
};

const createCustomer = async (customerName) => {
  const SQL = `INSERT INTO customers(id, name) VALUES($1, $2) RETURNING *`;
  const result = await client.query(SQL, [uuid.v4(), customerName]);
  return result.rows[0];
};

const createRestaurant = async (restaurantName) => {
  const SQL = `INSERT INTO restaurants(id, name) VALUES($1, $2) RETURNING *`;
  const result = await client.query(SQL, [uuid.v4(), restaurantName]);
  return result.rows[0];
};

const createReservation = async (customerId, restaurantId, date, partyCount) => {
  const SQL = `
    INSERT INTO reservations(id, date, party_count, restaurant_id, customer_id)
    VALUES($1, $2, $3, $4, $5) RETURNING *`;
  const result = await client.query(SQL, [
    uuid.v4(),
    date,
    partyCount,
    restaurantId,
    customerId,
  ]);
  return result.rows[0];
};

const fetchCustomers = async () => {
  const SQL = `SELECT * FROM customers`;
  const result = await client.query(SQL);
  return result.rows;
};

const fetchRestaurants = async () => {
  const SQL = `SELECT * FROM restaurants`;
  const result = await client.query(SQL);
  return result.rows;
};

const fetchReservations = async () => {
  const SQL = `
    SELECT reservations.*,
           customers.name AS customer_name,
           restaurants.name AS restaurant_name
    FROM reservations
    JOIN customers ON reservations.customer_id = customers.id
    JOIN restaurants ON reservations.restaurant_id = restaurants.id
  `;
  const result = await client.query(SQL);
  return result.rows;
};

const destroyReservation = async (reservationId) => {
  const SQL = `DELETE FROM reservations WHERE id = $1`;
  await client.query(SQL, [reservationId]);
};

const init = async () => {
  console.log("db initialized");
  await client.connect();
  await createTables();

  const customerNames = ["Bob", "Jan", "Jerry"];
  const restaurantNames = ["Nobu", "76", "Chili's"];

  const customers = [];
  for (const name of customerNames) {
    const customer = await createCustomer(name);
    console.log("customer created: " + name);
    customers.push(customer);
  }

  const restaurants = [];
  for (const name of restaurantNames) {
    const restaurant = await createRestaurant(name);
    console.log("restaurant created: " + name);
    restaurants.push(restaurant);
  }

 
  const reservation = await createReservation(
    customers[0].id,
    restaurants[0].id,
    "2025-02-14",
    2
  );
  console.log("reservation created:", reservation);
};

module.exports = {
  client,
  createTables,
  createCustomer,
  createRestaurant,
  createReservation,
  fetchCustomers,
  fetchRestaurants,
  fetchReservations,
  destroyReservation,
  init,
};
