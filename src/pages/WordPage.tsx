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

interface DictionaryError {
  title: string;
  message: string;
  resolution: string;
}

const WordPage = () => {
  const { word } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery<WordDefinition[], Error>({
    queryKey: ['word-details', word],
    queryFn: async () => {
      if (!word) throw new Error('No word provided');

      const response = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`
      );

      const data = await response.json();

      // Handle the specific "No Definitions Found" error from the API
      if (!response.ok) {
        const errorData = data as DictionaryError;
        throw new Error(errorData.message || 'No definitions found for this word');
      }

      return data;
    },
    retry: false, // Don't retry for 404s
  });

  // Common layout wrapper
  const PageWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="max-w-4xl mx-auto p-6">
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>
      {children}
    </div>
  );

  if (isLoading) {
    return (
      <PageWrapper>
        <Card>
          <CardContent className="p-6 space-y-6">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      </PageWrapper>
    );
  }

  if (error || !data) {
    return (
      <PageWrapper>
        <Alert variant="destructive">
          <AlertTitle>Word Not Found</AlertTitle>
          <AlertDescription className="space-y-4">
            <p>{error?.message || 'No definitions found for this word.'}</p>
            <p>Try searching for another word or check your spelling.</p>
          </AlertDescription>
        </Alert>
      </PageWrapper>
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
    <PageWrapper>
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
    </PageWrapper>
  );
};

export default WordPage;
