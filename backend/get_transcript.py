import sys
import json
from youtube_transcript_api import YouTubeTranscriptApi #type:ignore
from youtube_transcript_api.formatters import TextFormatter #type:ignore

def get_transcript(video_id):
    try:
        # Try to get transcript - this returns a FetchedTranscript object
        transcript_fetched = YouTubeTranscriptApi().fetch(video_id)
        
        # Convert FetchedTranscript to a regular list for JSON serialization
        transcript_list = list(transcript_fetched)
        
        # Format as simple text
        formatter = TextFormatter()
        text_formatted = formatter.format_transcript(transcript_list)
        
        # Return both raw segments and formatted text
        result = {
            "success": True,
            "segments": transcript_list,  # Now it's a regular list
            "full_text": text_formatted,
            "segment_count": len(transcript_list)
        }
        
        return [{"text": snippet.text, "start": snippet.start, "duration": snippet.duration} for snippet in transcript_fetched]
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "video_id": video_id
        }

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(json.dumps({"success": False, "error": "Usage: python get_transcript.py <video_id>"}), flush=True)
        sys.exit(1)
    
    video_id = sys.argv[1]
    result = get_transcript(video_id)
    
    # Ensure UTF-8 output to handle Unicode characters
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    print(json.dumps(result, indent=2, ensure_ascii=False), flush=True)