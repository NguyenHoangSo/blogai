import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Category name is required'],
        unique: true,
        trim: true,
        maxlength: [100, 'Name must be less than 100 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [300, 'Description too long']
    },
    slug: {
        type: String,
        trim: true,
        required: true,
        maxlength: [300, 'Description too long'],
        unique: true,
    }
});

const Category = mongoose.model('Category', CategorySchema);
export default Category; 