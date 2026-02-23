from PIL import Image
import sys

def remove_background(input_path, output_path):
    print(f"Processing {input_path}...")
    try:
        img = Image.open(input_path).convert("RGBA")
        datas = img.getdata()
        
        newData = []
        # Find the top-left pixel color to use as background reference
        bg_color = datas[0]
        
        # We will make pixels transparent if they are close to the bg_color
        # Threshold for color distance
        threshold = 50
        
        for item in datas:
            # item is (R, G, B, A)
            if abs(item[0] - bg_color[0]) < threshold and \
               abs(item[1] - bg_color[1]) < threshold and \
               abs(item[2] - bg_color[2]) < threshold:
                # Replace with transparent
                newData.append((255, 255, 255, 0))
            else:
                newData.append(item)
                
        img.putdata(newData)
        img.save(output_path, "PNG")
        print(f"Saved transparent image to {output_path}")
    except Exception as e:
        print(f"Error: {e}")

remove_background("public/baby-24w.png", "public/baby-24w-alpha.png")
