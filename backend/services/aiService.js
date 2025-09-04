import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});

export const aiService = {
    async generateBlogPost(config = {}, options = {}) {
        try {
            const {
                topic,
                audience,
                tone = "professional and friendly",
                structure = ["Introduction", "Main content", "Conclusion"],
                keywords = [],
                length = "1000 words"
            } = config;

            const systemPrompt = `
            Bạn là một người viết nội dung blog chuyên nghiệp, chuyên tạo ra các bài viết chất lượng cao cho website.

            Công việc của bạn là viết một bài blog hoàn chỉnh, hấp dẫn và thân thiện với SEO, tuân theo các nguyên tắc sau:

            - Sử dụng cấu trúc rõ ràng: Mở bài, các phần thân bài, kết luận
            - Chia bài viết thành các đoạn ngắn (2–4 câu) và sử dụng tiêu đề phụ (H2, H3)
            - Nội dung phải mang tính thông tin, hữu ích, dễ tiếp cận cho đối tượng người đọc
            - Từ khóa phải được đưa vào một cách tự nhiên, tránh nhồi nhét
            - Không sử dụng nội dung sáo rỗng hoặc lan man
            - Trình bày bằng văn bản thuần túy (plain text), tương thích với định dạng markdown
            `;

            const userPrompt = `
            Hãy viết một bài blog dựa trên các thông tin sau:

            - Chủ đề: ${topic}
            - Đối tượng độc giả: ${audience}
            - Giọng văn mong muốn: ${tone}
            - Cấu trúc bài viết: ${structure.join(", ")}
            - Từ khóa chính: ${keywords.join(", ")}
            - Độ dài mong muốn: khoảng ${length}

            Yêu cầu:
            - Viết phần mở đầu hấp dẫn, thu hút người đọc
            - Mỗi phần trong thân bài cần có tiêu đề rõ ràng theo cấu trúc đã cho
            - Phần kết luận nên tóm tắt nội dung và có thể kèm theo lời kêu gọi hành động (CTA)
            - Sử dụng tiêu đề phụ và danh sách đánh dấu (bullet points) nếu phù hợp
            - Đưa các từ khóa vào một cách tự nhiên trong nội dung
            - Không cần lời dẫn phản hồi, chỉ viết nội dung
            `;


            const completion = await openai.chat.completions.create({
                model: "gemini-2.0-flash", // hoặc "gemini-2.0-flash" nếu dùng Gemini API
                messages: [
                    { role: "system", content: systemPrompt.trim() },
                    { role: "user", content: userPrompt.trim() }
                ],
                temperature: options.temperature || 0.7,
                max_tokens: options.maxTokens || 2000
            });

            return {
                content: completion.choices[0].message.content,
                model: "gemini-2.0-flash",
                prompt: userPrompt
            };
        } catch (error) {
            console.error('Error generating blog post:', error);
            throw new Error('Failed to generate blog post');
        }
    },
    async generateTitle(content) {
        try {
            const completion = await openai.chat.completions.create({
                model: "gemini-2.0-flash",
                messages: [
                    {
                        role: "system",
                        content: `Bạn là một chuyên gia viết tiêu đề blog hấp dẫn và tối ưu SEO.
                    Hãy tạo ra 4 tiêu đề blog bằng tiếng Việt cho nội dung hoặc chủ đề được cung cấp. Mỗi tiêu đề cần:

                    - Có độ dài dưới 55 ký tự
                    - Mỗi tiêu đề có phong cách khác nhau: ví dụ như cung cấp thông tin, cảm xúc, hoặc dạng câu hỏi
                    - Có chứa từ khóa phù hợp nếu có thể
                    - Trình bày dưới dạng danh sách đánh số: 1. 2. 3. 4.
                    - Mỗi tiêu đề theo 1 trong 4 phong cách viết khác nhau: học thuật, truyền cảm hứng, chuyên nghiệp, kể chuyện 
                    - Không cần lời dẫn phản hồi, chỉ liệt kê.`
                    },
                    {
                        role: "user",
                        content: `Chủ đề là: "${content}"`
                    }
                ],
                temperature: 0.7,
                max_tokens: 150
            });

            const raw = completion.choices[0].message.content.trim();

            // Extract titles from numbered list format
            const titles = raw
                .split('\n')
                .map(line => line.replace(/^\d+\.\s*/, '').trim())
                .filter(title => title.length > 0);
            return {
                titles,
                prompt: content,
                model: "gemini-2.0-flash"
            };
        } catch (error) {
            console.error('Error generating title:', error);
            throw new Error('Failed to generate title suggestions');
        }
    },

    async optimizeSEO(title, content) {
        try {
            const completion = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    {
                        role: "system",
                        content: "You are an SEO expert. Optimize content for search engines while maintaining readability."
                    },
                    {
                        role: "user",
                        content: `Optimize this blog post for SEO:\nTitle: ${title}\nContent: ${content}`
                    }
                ],
                temperature: 0.5
            });

            return {
                seoTitle: title,
                seoDescription: completion.choices[0].message.content,
                optimizedContent: content
            };
        } catch (error) {
            console.error('Error optimizing SEO:', error);
            throw new Error('Failed to optimize SEO');
        }
    }
}; 