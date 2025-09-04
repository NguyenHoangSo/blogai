import Category from "../models/Category.js";
export const getAllCategories = async (req, res, next) => {
    try {
        const categories = await Category.find().sort({ createdAt: -1 });
        res.status(200).json({ message: "get success all categories", data: categories });
    } catch (error) {
        next(error);
    }
};

// GET single category by slug
export const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await Category.findById(id);
        if (!category) return res.status(404).json({ message: 'Category not found' });

        res.status(200).json(category);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch category', error });
    }
};