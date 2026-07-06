import express from "express";
import {
  addAddress,
  updateAddress,
  deleteAddress,
  getAddresses,
  updateAltPhone,
} from "../controller/addressController.js";
import { isAuthenticated } from "../middlewires/isAuthenticated.js";

const router = express.Router();

router.get("/", isAuthenticated, getAddresses);
router.post("/", isAuthenticated, addAddress);
router.put("/:addressId", isAuthenticated, updateAddress);
router.delete("/:addressId", isAuthenticated, deleteAddress);
router.put("/alt-phone/update", isAuthenticated, updateAltPhone);

export default router;
