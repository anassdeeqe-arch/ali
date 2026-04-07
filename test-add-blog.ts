import { store } from './src/lib/store';

async function testAddBlog() {
  try {
    console.log("Attempting to add blog...");
    await store.addBlog({
      title: "Test Blog Post",
      content: "This is a test blog post content that is long enough.",
      image: "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?auto=format&fit=crop&q=80&w=800",
      category: "Summer",
      views: 0
    });
    console.log("Successfully added blog!");
  } catch (error) {
    console.error("Failed to add blog:", error);
  }
}

testAddBlog();
