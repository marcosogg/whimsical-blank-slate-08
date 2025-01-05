import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import WordPhonetics from "@/components/word-details/WordPhonetics";
import WordDefinitions from "@/components/word-details/WordDefinitions";
import WordRelated from "@/components/word-details/WordRelated";
import WordSources from "@/components/word-details/WordSources";

interface WordDefinition {
  word: string;
  phonetics: Array<{
    text?: string;
    audio?: string;
  }>;
  meanings: Array<{
    partOfSpeech: string;
    definitions: Array<{
      definition: string;
      example?: string;
      synonyms?: string[];
      antonyms?: string[];
    }>;
    synonyms?: string[];
    antonyms?: string[];
  }>;
  sourceUrls?: string[];
}

const WordPage = () => {
  const { word } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery<WordDefinition[]>({
    queryKey: ['word-details', word],
    queryFn: async () => {
      if (!word) throw new Error('No word provided');

      const response = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`
      );

      // Check for HTTP error
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch word details');
      }

      const data = await response.json();
        // Check if word is not found
        if (data && data.title === "No Definitions Found") {
            throw new Error(data.message || "No definitions found for this word");
        }

      // Check if data is in the expected format (an array with at least one element)
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('Invalid data format received from the API');
      }
      
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Alert>
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : 'An unexpected error occurred.'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const wordData = data[0];
  const allSynonyms = Array.from(
    new Set(
      wordData.meanings.flatMap(m =>
        [...(m.synonyms || []), ...m.definitions.flatMap(d => d.synonyms || [])]
      )
    )
  );

  const allAntonyms = Array.from(
    new Set(
      wordData.meanings.flatMap(m =>
        [...(m.antonyms || []), ...m.definitions.flatMap(d => d.antonyms || [])]
      )
    )
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <Card>
        <CardHeader>
          <WordPhonetics word={wordData.word} phonetics={wordData.phonetics} />
        </CardHeader>

        <CardContent className="space-y-6">
          <WordDefinitions meanings={wordData.meanings} />

          {(allSynonyms.length > 0 || allAntonyms.length > 0) && (
            <>
              <Separator className="my-4" />
              <WordRelated synonyms={allSynonyms} antonyms={allAntonyms} />
            </>
          )}

          {wordData.sourceUrls && wordData.sourceUrls.length > 0 && (
            <>
              <Separator className="my-4" />
              <WordSources sourceUrls={wordData.sourceUrls} />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WordPage;
