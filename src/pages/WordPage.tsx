import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import AudioPlayer from "@/components/AudioPlayer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

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
      const response = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word!)}`
      );
      if (!response.ok) {
        throw new Error('Word not found');
      }
      return response.json();
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

  if (error) {
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
          <AlertDescription>
            No definitions found for this word. Please try another word.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const wordData = data?.[0];

  if (!wordData) return null;

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
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold">{wordData.word}</h1>
            <AudioPlayer word={wordData.word} />
          </div>
          {wordData.phonetics.map((phonetic, index) => (
            phonetic.text && (
              <span key={index} className="text-gray-600">
                {phonetic.text}
              </span>
            )
          ))}
        </CardHeader>

        <CardContent className="space-y-6">
          {wordData.meanings.map((meaning, index) => (
            <div key={index} className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Badge variant="secondary">
                  {meaning.partOfSpeech}
                </Badge>
              </h2>
              
              <div className="space-y-4">
                {meaning.definitions.map((def, defIndex) => (
                  <div key={defIndex} className="pl-4 border-l-2 border-gray-200">
                    <p className="text-gray-900">{def.definition}</p>
                    {def.example && (
                      <p className="text-gray-600 mt-2 italic">
                        "{def.example}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {(allSynonyms.length > 0 || allAntonyms.length > 0) && (
            <>
              <Separator className="my-4" />
              <div className="space-y-4">
                {allSynonyms.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Synonyms</h3>
                    <div className="flex flex-wrap gap-2">
                      {allSynonyms.map((synonym, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                          onClick={() => navigate(`/word/${synonym}`)}
                        >
                          {synonym}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {allAntonyms.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Antonyms</h3>
                    <div className="flex flex-wrap gap-2">
                      {allAntonyms.map((antonym, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                          onClick={() => navigate(`/word/${antonym}`)}
                        >
                          {antonym}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {wordData.sourceUrls && wordData.sourceUrls.length > 0 && (
            <>
              <Separator className="my-4" />
              <div>
                <h3 className="font-semibold mb-2">Sources</h3>
                <div className="space-y-2">
                  {wordData.sourceUrls.map((url, index) => (
                    <a
                      key={index}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-600 hover:underline"
                    >
                      {url}
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WordPage;