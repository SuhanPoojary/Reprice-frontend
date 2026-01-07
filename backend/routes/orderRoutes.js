const express = require("express");
const router = express.Router();

const { pool } = require("../db");
const { authenticateToken } = require("../middleware/authMiddleware");

router.post("/create", authenticateToken, async (req, res) => {
  try {
    const {
      address,
      city,
      state,
      pincode,
      latitude,
      longitude,
      phone,
      pickupDate,
      timeSlot, 
      paymentMethod,
    } = req.body;

    const customerId = req.user.id;

    const addressResult = await pool.query(
      `INSERT INTO customer_addresses
       (customer_id, full_address, city, state, pincode, latitude, longitude)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING id`,
      [customerId, address, city, state, pincode, latitude, longitude]
    );

    const addressId = addressResult.rows[0].id;

    const orderResult = await pool.query(
      `INSERT INTO orders
       (customer_id, address_id, phone_model, phone_variant, phone_condition,
        price, pickup_date, payment_method)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING *`,
      [
        customerId,
        addressId,
        phone.name,
        phone.variant,
        phone.condition,
        phone.price,
        pickupDate,
        paymentMethod,
      ]
    );

    res.status(201).json({
      success: true,
      order: orderResult.rows[0],
    });
  } catch (err) {
    console.error("CREATE ORDER ERROR:", err);
    res.status(500).json({ success: false });
  }
});

// ASSIGN ORDER TO AGENT (Start Pickup)
router.patch("/:id/assign", authenticateToken, async (req, res) => {
  try {
    const orderId = req.params.id;
    const agentId = req.user.id;

    const result = await pool.query(
      `
      UPDATE orders
      SET status = 'in-progress', agent_id = $1
      WHERE id = $2 AND status = 'pending' AND agent_id IS NULL
      RETURNING *
      `,
      [agentId, orderId]
    );

    if (result.rows.length === 0) {
      return res.status(409).json({
        success: false,
        message: "Order already assigned or not available",
      });
    }

    res.json({
      success: true,
      order: result.rows[0],
    });
  } catch (err) {
    console.error("ASSIGN ORDER ERROR:", err);
    res.status(500).json({ success: false });
  }
});



module.exports = router;
