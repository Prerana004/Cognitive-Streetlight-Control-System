"""
Main entry point for Accident Detection System
"""

from camera import startapplication
import sys

if __name__ == '__main__':
    # Default: auto-detect video source
    video_source = None
    
    # Check command line arguments
    if len(sys.argv) > 1:
        video_source = sys.argv[1]
        # Try to parse as integer (camera index)
        try:
            video_source = int(video_source)
        except ValueError:
            # Keep as string (file path)
            pass
    
    print("=" * 60)
    print("Accident Detection System")
    print("=" * 60)
    print("\nStarting accident detection...")
    print("Press 'q' to quit")
    print("-" * 60)
    
    try:
        startapplication(video_source=video_source)
    except KeyboardInterrupt:
        print("\n\nStopped by user.")
    except Exception as e:
        print(f"\nERROR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)