const Address = require("../models/Address");

// ── GET /address ──────────────────────────────────────────────────────────────
const index = async (req, res) => {
    const addresses = await Address.find({ user: req.user._id }).sort({ isDefault: -1, createdAt: -1 });
    res.render("address/index", {
        title: "My Addresses — Home Harmony",
        addresses,
    });
};

// ── POST /address ─────────────────────────────────────────────────────────────
const createAddress = async (req, res) => {
    const { label, fullName, phone, line1, line2, city, state, pincode, isDefault } = req.body;

    if (isDefault === "on") {
        await Address.updateMany({ user: req.user._id }, { isDefault: false });
    }

    const address = new Address({
        user: req.user._id,
        label, fullName, phone, line1, line2, city, state, pincode,
        isDefault: isDefault === "on",
    });

    await address.save();
    req.flash("success", "Address saved! Now complete your order. 🏠");

    // If came from checkout, redirect back there
    const redirect = req.query.redirect || "/address";
    res.redirect(redirect);
};

// ── GET /address/:id/edit ─────────────────────────────────────────────────────
const renderEditForm = async (req, res) => {
    const address = await Address.findOne({ _id: req.params.id, user: req.user._id });
    if (!address) {
        req.flash("error", "Address not found.");
        return res.redirect("/address");
    }
    res.render("address/edit", {
        title: "Edit Address — Home Harmony",
        address,
    });
};

// ── PUT /address/:id ──────────────────────────────────────────────────────────
const updateAddress = async (req, res) => {
    const { label, fullName, phone, line1, line2, city, state, pincode, isDefault } = req.body;

    if (isDefault === "on") {
        await Address.updateMany({ user: req.user._id }, { isDefault: false });
    }

    await Address.findOneAndUpdate(
        { _id: req.params.id, user: req.user._id },
        { label, fullName, phone, line1, line2, city, state, pincode, isDefault: isDefault === "on" },
        { new: true, runValidators: true }
    );

    req.flash("success", "Address updated! ✅");
    res.redirect("/address");
};

// ── DELETE /address/:id ───────────────────────────────────────────────────────
const deleteAddress = async (req, res) => {
    await Address.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    req.flash("success", "Address removed.");
    res.redirect("/address");
};

// ── POST /address/:id/set-default ─────────────────────────────────────────────
const setDefault = async (req, res) => {
    await Address.updateMany({ user: req.user._id }, { isDefault: false });
    await Address.findOneAndUpdate(
        { _id: req.params.id, user: req.user._id },
        { isDefault: true }
    );
    req.flash("success", "Default address updated! 🏠");
    res.redirect("/address");
};

module.exports = { index, createAddress, renderEditForm, updateAddress, deleteAddress, setDefault };