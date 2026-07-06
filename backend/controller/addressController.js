import { User } from "../models/user_model.js";


export const addAddress = async (req, res) => {
  try {
    const userId = req.userId;
    const { label, fullAddress, city, state, pincode, phone, isDefault } =
      req.body;

    if (!fullAddress) {
      return res.status(400).json({
        success: false,
        message: "Full address is required",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // if this new address is set as default, unset previous defaults
    if (isDefault) {
      user.addresses.forEach((addr) => (addr.isDefault = false));
    }

    user.addresses.push({
      label,
      fullAddress,
      city,
      state,
      pincode,
      phone,
      isDefault: isDefault || user.addresses.length === 0, // first address auto-default
    });

    await user.save();

    return res.status(201).json({
      success: true,
      message: "Address added successfully",
      addresses: user.addresses,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Update an existing address
 */
export const updateAddress = async (req, res) => {
  try {
    const userId = req.userId;
    const { addressId } = req.params;
    const { label, fullAddress, city, state, pincode, phone, isDefault } =
      req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const address = user.addresses.id(addressId);
    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    if (label !== undefined) address.label = label;
    if (fullAddress !== undefined) address.fullAddress = fullAddress;
    if (city !== undefined) address.city = city;
    if (state !== undefined) address.state = state;
    if (pincode !== undefined) address.pincode = pincode;
    if (phone !== undefined) address.phone = phone;

    if (isDefault) {
      user.addresses.forEach((addr) => (addr.isDefault = false));
      address.isDefault = true;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Address updated successfully",
      addresses: user.addresses,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Delete an address
 */
export const deleteAddress = async (req, res) => {
  try {
    const userId = req.userId;
    const { addressId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const address = user.addresses.id(addressId);
    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    const wasDefault = address.isDefault;
    address.deleteOne();

    // if we deleted the default address, make the first remaining one default
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Address deleted successfully",
      addresses: user.addresses,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get all addresses for the logged-in customer
 */
export const getAddresses = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).select("addresses altPhone");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      addresses: user.addresses,
      altPhone: user.altPhone,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Add / update the alternate phone number on the account
 */
export const updateAltPhone = async (req, res) => {
  try {
    const userId = req.userId;
    const { altPhone } = req.body;

    if (!altPhone) {
      return res.status(400).json({
        success: false,
        message: "Alternate phone number is required",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.altPhone = altPhone;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Alternate phone number updated successfully",
      altPhone: user.altPhone,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
