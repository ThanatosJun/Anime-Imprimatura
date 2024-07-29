def main(image_path, CHD_name):
    if image_path is None or CHD_name is None:
        raise ValueError("Both image_path and CHD_name must be provided.")
    # Your training logic here

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python PA_autoTraing_v5.py <image_path> <CHD_name>")
        sys.exit(1)

    image_path = sys.argv[1]
    CHD_name = sys.argv[2]

    main(image_path, CHD_name)