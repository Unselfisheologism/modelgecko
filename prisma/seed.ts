import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const models = [
    {
        slug: 'gpt-4-turbo',
        name: 'GPT-4 Turbo',
        provider: 'OpenAI',
        releaseDate: new Date('2023-11-06'),
        contextWindow: 128000,
        modalities: ['text', 'vision'],
        benchmarkScores: {
            mmlu: 85.4,
            gpqa: 73.3,
            hellaswag: 89.1,
            mmlu_c0: 86.4,
            humaneval: 90.2,
            mmlupro: 74.3,
        },
        pricing: {
            input: 0.01,
            output: 0.03,
            prompt: 'GPT-4 Turbo is OpenAI\'s most capable model with 128K context.',
        },
        capabilities: ['Function calling', 'JSON mode', 'Vision', 'DALL-E 3'],
        links: {
            website: 'https://openai.com/gpt-4',
            api: 'https://platform.openai.com/docs/models/gpt-4-turbo',
        },
    },
    {
        slug: 'gpt-4o',
        name: 'GPT-4o',
        provider: 'OpenAI',
        releaseDate: new Date('2024-05-13'),
        contextWindow: 128000,
        modalities: ['text', 'vision', 'audio'],
        benchmarkScores: {
            mmlu: 88.7,
            gpqa: 76.1,
            hellaswag: 91.1,
            mmlu_c0: 89.2,
            humaneval: 92.0,
            mmlupro: 78.5,
        },
        pricing: {
            input: 0.005,
            output: 0.015,
            prompt: 'GPT-4o is OpenAI\'s new flagship model with native multimodality.',
        },
        capabilities: ['Native multimodal', 'Real-time voice', 'Vision', 'Function calling'],
        links: {
            website: 'https://openai.com/gpt-4o',
            api: 'https://platform.openai.com/docs/models/gpt-4o',
        },
    },
    {
        slug: 'claude-3-opus',
        name: 'Claude 3 Opus',
        provider: 'Anthropic',
        releaseDate: new Date('2024-03-04'),
        contextWindow: 200000,
        modalities: ['text', 'vision'],
        benchmarkScores: {
            mmlu: 86.8,
            gpqa: 78.5,
            hellaswag: 88.7,
            mmlu_c0: 87.3,
            humaneval: 84.9,
            mmlupro: 78.9,
        },
        pricing: {
            input: 0.015,
            output: 0.075,
            prompt: 'Claude 3 Opus is Anthropic\'s most capable model.',
        },
        capabilities: ['Long context', 'Vision', 'Tool use', 'Computer use'],
        links: {
            website: 'https://www.anthropic.com/claude',
            api: 'https://docs.anthropic.com/en/docs/about-claude/models',
        },
    },
    {
        slug: 'claude-3-5-sonnet',
        name: 'Claude 3.5 Sonnet',
        provider: 'Anthropic',
        releaseDate: new Date('2024-06-20'),
        contextWindow: 200000,
        modalities: ['text', 'vision'],
        benchmarkScores: {
            mmlu: 88.3,
            gpqa: 76.7,
            hellaswag: 90.1,
            mmlu_c0: 89.0,
            humaneval: 92.0,
            mmlupro: 80.2,
        },
        pricing: {
            input: 0.003,
            output: 0.015,
            prompt: 'Claude 3.5 Sonnet balances capability and speed.',
        },
        capabilities: ['Long context', 'Vision', 'Tool use', 'Computer use'],
        links: {
            website: 'https://www.anthropic.com/claude',
            api: 'https://docs.anthropic.com/en/docs/about-claude/models',
        },
    },
    {
        slug: 'gemini-1-5-pro',
        name: 'Gemini 1.5 Pro',
        provider: 'Google',
        releaseDate: new Date('2024-05-14'),
        contextWindow: 2000000,
        modalities: ['text', 'vision', 'audio', 'video'],
        benchmarkScores: {
            mmlu: 85.9,
            gpqa: 74.1,
            hellaswag: 88.6,
            mmlu_c0: 87.1,
            humaneval: 84.7,
            mmlupro: 75.4,
        },
        pricing: {
            input: 0.00125,
            output: 0.005,
            prompt: 'Gemini 1.5 Pro with 2M context window.',
        },
        capabilities: ['2M context', 'Native multimodality', 'Long context', 'Code execution'],
        links: {
            website: 'https://gemini.google.com',
            api: 'https://ai.google.dev/docs',
        },
    },
    {
        slug: 'gemini-2-0-flash',
        name: 'Gemini 2.0 Flash',
        provider: 'Google',
        releaseDate: new Date('2024-12-11'),
        contextWindow: 1000000,
        modalities: ['text', 'vision', 'audio'],
        benchmarkScores: {
            mmlu: 87.4,
            gpqa: 74.8,
            hellaswag: 89.3,
            mmlu_c0: 88.1,
            humaneval: 87.2,
            mmlupro: 78.1,
        },
        pricing: {
            input: 0.0001,
            output: 0.0004,
            prompt: 'Gemini 2.0 Flash - fast and capable.',
        },
        capabilities: ['1M context', 'Native multimodality', 'Speed', 'Low latency'],
        links: {
            website: 'https://gemini.google.com',
            api: 'https://ai.google.dev/docs',
        },
    },
    {
        slug: 'llama-3-1-405b',
        name: 'Llama 3.1 405B',
        provider: 'Meta',
        releaseDate: new Date('2024-07-23'),
        contextWindow: 128000,
        modalities: ['text'],
        benchmarkScores: {
            mmlu: 88.6,
            gpqa: 73.3,
            hellaswag: 89.0,
            mmlu_c0: 87.2,
            humaneval: 84.4,
            mmlupro: 74.9,
        },
        pricing: {
            input: 0.0,
            output: 0.0,
            prompt: 'Llama 3.1 405B - open source flagship model.',
        },
        capabilities: ['Open source', '128K context', 'Tool calling', 'Multilingual'],
        links: {
            website: 'https://llama.com',
            api: 'https://huggingface.co/meta-llama/Llama-3.1-405B',
        },
    },
    {
        slug: 'llama-3-3-70b',
        name: 'Llama 3.3 70B',
        provider: 'Meta',
        releaseDate: new Date('2024-12-06'),
        contextWindow: 128000,
        modalities: ['text'],
        benchmarkScores: {
            mmlu: 87.5,
            gpqa: 71.9,
            hellaswag: 88.4,
            mmlu_c0: 86.8,
            humaneval: 83.7,
            mmlupro: 73.8,
        },
        pricing: {
            input: 0.0,
            output: 0.0,
            prompt: 'Llama 3.3 70B - efficient and capable.',
        },
        capabilities: ['Open source', '128K context', 'Tool calling', 'Multilingual'],
        links: {
            website: 'https://llama.com',
            api: 'https://huggingface.co/meta-llama/Llama-3.3-70B-Instruct',
        },
    },
    {
        slug: 'mistral-large-2',
        name: 'Mistral Large 2',
        provider: 'Mistral AI',
        releaseDate: new Date('2024-07-24'),
        contextWindow: 128000,
        modalities: ['text'],
        benchmarkScores: {
            mmlu: 87.0,
            gpqa: 72.8,
            hellaswag: 88.2,
            mmlu_c0: 86.7,
            humaneval: 85.2,
            mmlupro: 74.3,
        },
        pricing: {
            input: 0.002,
            output: 0.006,
            prompt: 'Mistral Large 2 - powerful open model.',
        },
        capabilities: ['Open source', '128K context', 'Function calling', 'Code generation'],
        links: {
            website: 'https://mistral.ai',
            api: 'https://docs.mistral.ai',
        },
    },
    {
        slug: 'qwen-2-5-72b',
        name: 'Qwen 2.5 72B',
        provider: 'Alibaba',
        releaseDate: new Date('2024-09-19'),
        contextWindow: 32768,
        modalities: ['text'],
        benchmarkScores: {
            mmlu: 86.1,
            gpqa: 70.4,
            hellaswag: 87.9,
            mmlu_c0: 85.3,
            humaneval: 82.8,
            mmlupro: 71.9,
        },
        pricing: {
            input: 0.0009,
            output: 0.0009,
            prompt: 'Qwen 2.5 72B - strong open model from Alibaba.',
        },
        capabilities: ['Open source', 'Multilingual', 'Code generation', 'Function calling'],
        links: {
            website: 'https://qwen.ai',
            api: 'https://huggingface.co/Qwen/Qwen2.5-72B-Instruct',
        },
    },
    {
        slug: 'dall-e-3',
        name: 'DALL-E 3',
        provider: 'OpenAI',
        releaseDate: new Date('2023-10-02'),
        modalities: ['image'],
        pricing: {
            input: 0.004,
            output: 0.0,
            prompt: 'DALL-E 3 is OpenAI\'s image generation model.',
        },
        capabilities: ['Image generation', 'Text rendering', 'High quality', 'Prompt adherence'],
        links: {
            website: 'https://openai.com/dall-e-3',
            api: 'https://platform.openai.com/docs/models/dall-e-3',
        },
    },
    {
        slug: 'midjourney-v6',
        name: 'Midjourney V6',
        provider: 'Midjourney',
        releaseDate: new Date('2023-12-21'),
        modalities: ['image'],
        pricing: {
            input: 0.01,
            output: 0.0,
            prompt: 'Midjourney V6 is a powerful image generation model.',
        },
        capabilities: ['Image generation', 'Artistic style', 'High detail', 'Creative'],
        links: {
            website: 'https://midjourney.com',
            api: 'https://discord.com/channels/662267976984297473',
        },
    },
    {
        slug: 'suno-v4',
        name: 'Suno V4',
        provider: 'Suno AI',
        releaseDate: new Date('2024-12-12'),
        modalities: ['audio'],
        pricing: {
            input: 0.10,
            output: 0.0,
            prompt: 'Suno V4 creates high-quality music from text prompts.',
        },
        capabilities: ['Music generation', 'Song creation', 'Various styles', 'Vocals'],
        links: {
            website: 'https://suno.ai',
            api: 'https://suno.ai/pricing',
        },
    },
    {
        slug: 'gpt-4o-mini',
        name: 'GPT-4o Mini',
        provider: 'OpenAI',
        releaseDate: new Date('2024-07-18'),
        contextWindow: 128000,
        modalities: ['text', 'vision'],
        benchmarkScores: {
            mmlu: 82.0,
            gpqa: 59.8,
            hellaswag: 86.6,
            mmlu_c0: 83.5,
            humaneval: 87.6,
            mmlupro: 68.9,
        },
        pricing: {
            input: 0.00015,
            output: 0.0006,
            prompt: 'GPT-4o Mini is OpenAI\'s small, fast model.',
        },
        capabilities: ['Fast', 'Vision', 'Function calling', 'JSON mode'],
        links: {
            website: 'https://openai.com/gpt-4o-mini',
            api: 'https://platform.openai.com/docs/models/gpt-4o-mini',
        },
    },
    {
        slug: 'deepseek-v3',
        name: 'DeepSeek V3',
        provider: 'DeepSeek',
        releaseDate: new Date('2024-12-05'),
        contextWindow: 64000,
        modalities: ['text'],
        benchmarkScores: {
            mmlu: 88.5,
            gpqa: 73.3,
            hellaswag: 89.2,
            mmlu_c0: 87.4,
            humaneval: 86.1,
            mmlupro: 75.2,
        },
        pricing: {
            input: 0.00027,
            output: 0.0011,
            prompt: 'DeepSeek V3 is a powerful open-weight model.',
        },
        capabilities: ['Open source', 'Code generation', 'Mathematics', 'Reasoning'],
        links: {
            website: 'https://deepseek.com',
            api: 'https://platform.deepseek.com',
        },
    },
]

async function main() {
    console.log('Seeding database...')

    // Clear existing data
    await prisma.model.deleteMany()
    await prisma.pricingPlan.deleteMany()

    // Seed models
    for (const model of models) {
        await prisma.model.create({
            data: model,
        })
    }

    console.log(`Seeded ${models.length} models`)

    // Seed pricing plans
    const pricingPlans = [
        {
            id: 'free',
            name: 'Free',
            description: 'Perfect for testing and exploration',
            dodoPriceId: 'price_free',
            credits: 1000,
            priceUsd: 0,
            isActive: true,
        },
        {
            id: 'starter',
            name: 'Starter',
            description: 'For hobby projects and small apps',
            dodoPriceId: 'price_starter',
            credits: 10000,
            priceUsd: 29,
            isActive: true,
        },
        {
            id: 'pro',
            name: 'Pro',
            description: 'For production applications',
            dodoPriceId: 'price_pro',
            credits: 100000,
            priceUsd: 99,
            isActive: true,
        },
        {
            id: 'enterprise',
            name: 'Enterprise',
            description: 'Custom solutions for large scale',
            dodoPriceId: 'price_enterprise',
            credits: 1000000,
            priceUsd: 499,
            isActive: true,
        },
    ]

    for (const plan of pricingPlans) {
        await prisma.pricingPlan.create({
            data: plan,
        })
    }

    console.log(`Seeded ${pricingPlans.length} pricing plans`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
