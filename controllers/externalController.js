const axios = require('axios');

// @desc    Analyze sentiment using external API
// @route   POST /api/sentiment/analyze
// @access  Private
const analyzeSentiment = async (req, res, next) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Text is required for sentiment analysis'
      });
    }

    // Basic sentiment analysis (fallback implementation)
    const basicSentiment = getBasicSentiment(text);

    // If external API key is available, use it
    if (process.env.SENTIMENT_API_KEY) {
      try {
        // Example using a hypothetical sentiment API
        const response = await axios.post('https://api.sentimentanalysis.com/analyze', {
          text: text
        }, {
          headers: {
            'Authorization': `Bearer ${process.env.SENTIMENT_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 5000
        });

        return res.status(200).json({
          success: true,
          data: {
            sentiment: response.data,
            source: 'external_api'
          }
        });
      } catch (apiError) {
        console.log('External API failed, using fallback:', apiError.message);
      }
    }

    // Use basic sentiment analysis as fallback
    res.status(200).json({
      success: true,
      data: {
        sentiment: basicSentiment,
        source: 'basic_analysis'
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get motivational quotes based on mood
// @route   GET /api/quotes/mood
// @access  Private
const getQuotesByMood = async (req, res, next) => {
  try {
    const { mood, sentiment } = req.query;

    // Default quotes based on mood/sentiment
    const quotes = getDefaultQuotes(mood, sentiment);

    // If external API key is available, fetch from external service
    if (process.env.QUOTES_API_KEY) {
      try {
        const response = await axios.get('https://api.quotegarden.com/api/v3/quotes', {
          params: {
            author: 'motivational',
            category: mood === 'sad' || mood === 'very_sad' ? 'inspirational' : 'happiness'
          },
          headers: {
            'Authorization': `Bearer ${process.env.QUOTES_API_KEY}`
          },
          timeout: 5000
        });

        if (response.data && response.data.data) {
          return res.status(200).json({
            success: true,
            data: {
              quotes: response.data.data.slice(0, 3),
              source: 'external_api'
            }
          });
        }
      } catch (apiError) {
        console.log('External quotes API failed, using fallback:', apiError.message);
      }
    }

    res.status(200).json({
      success: true,
      data: {
        quotes,
        source: 'default_collection'
      }
    });
  } catch (error) {
    next(error);
  }
};

// Basic sentiment analysis function
const getBasicSentiment = (text) => {
  const positiveWords = [
    'happy', 'joy', 'love', 'excited', 'wonderful', 'amazing', 'great', 'good', 
    'fantastic', 'awesome', 'brilliant', 'excellent', 'perfect', 'beautiful',
    'grateful', 'blessed', 'peaceful', 'content', 'optimistic', 'hopeful'
  ];
  
  const negativeWords = [
    'sad', 'angry', 'hate', 'terrible', 'awful', 'bad', 'horrible', 'depressed',
    'anxious', 'worried', 'stressed', 'frustrated', 'disappointed', 'lonely',
    'tired', 'exhausted', 'overwhelmed', 'confused', 'scared', 'afraid'
  ];
  
  const words = text.toLowerCase().split(/\s+/);
  let positiveCount = 0;
  let negativeCount = 0;
  
  words.forEach(word => {
    if (positiveWords.some(pw => word.includes(pw))) positiveCount++;
    if (negativeWords.some(nw => word.includes(nw))) negativeCount++;
  });
  
  const totalSentimentWords = positiveCount + negativeCount;
  let score = 0;
  let label = 'neutral';
  let confidence = 0.5;
  
  if (totalSentimentWords > 0) {
    score = (positiveCount - negativeCount) / Math.max(totalSentimentWords, words.length * 0.1);
    confidence = Math.min(totalSentimentWords / words.length * 3, 1);
    
    if (score > 0.2) label = 'positive';
    else if (score < -0.2) label = 'negative';
  }
  
  return {
    score: Math.max(-1, Math.min(1, score)),
    label,
    confidence: Math.round(confidence * 100) / 100
  };
};

// Default quotes collection
const getDefaultQuotes = (mood, sentiment) => {
  const positiveQuotes = [
    {
      text: "The best way to predict the future is to create it.",
      author: "Peter Drucker"
    },
    {
      text: "Happiness is not something ready made. It comes from your own actions.",
      author: "Dalai Lama"
    },
    {
      text: "Life is 10% what happens to you and 90% how you react to it.",
      author: "Charles R. Swindoll"
    }
  ];

  const motivationalQuotes = [
    {
      text: "The only way to do great work is to love what you do.",
      author: "Steve Jobs"
    },
    {
      text: "Believe you can and you're halfway there.",
      author: "Theodore Roosevelt"
    },
    {
      text: "It does not matter how slowly you go as long as you do not stop.",
      author: "Confucius"
    }
  ];

  const comfortingQuotes = [
    {
      text: "This too shall pass. It might pass like a kidney stone, but it will pass.",
      author: "Unknown"
    },
    {
      text: "You are braver than you believe, stronger than you seem, and smarter than you think.",
      author: "A.A. Milne"
    },
    {
      text: "Every storm runs out of rain. Every dark night turns into day.",
      author: "Maya Angelou"
    }
  ];

  if (mood === 'very_happy' || mood === 'happy' || sentiment === 'positive') {
    return positiveQuotes;
  } else if (mood === 'very_sad' || mood === 'sad' || sentiment === 'negative') {
    return comfortingQuotes;
  } else {
    return motivationalQuotes;
  }
};

module.exports = {
  analyzeSentiment,
  getQuotesByMood
};
