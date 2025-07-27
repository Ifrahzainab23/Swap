import { useEffect, useState } from "react";
import Sentiment from "sentiment";

const sentimentAnalyzer = new Sentiment();

const useSentiment = (text) => {
  const [sentiment, setSentiment] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!text || text.trim().length < 3) {
      setSentiment(null);
      return;
    }

    setLoading(true);

    const delay = setTimeout(() => {
      const { score } = sentimentAnalyzer.analyze(text);

      if (score > 1) {
        setSentiment("positive");
      } else if (score < -1) {
        setSentiment("negative");
      } else {
        setSentiment("neutral");
      }

      setLoading(false);
    }, 400); // debounce

    return () => clearTimeout(delay);
  }, [text]);

  return { sentiment, loading, error: null };
};

export default useSentiment;
