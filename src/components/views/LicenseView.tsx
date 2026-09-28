import MarkdownRenderer from "./MarkdownRenderer";
import { StaticContentView } from "./StaticContentView";

const currentYear = new Date().getFullYear();

const licenseMarkdown = `
# License & Terms of Use

Copyright (c) ${currentYear} dhimapp

Permission is granted as [CC BY-SA 4.0](https://de.wikipedia.org/wiki/Creative_Commons).
You can copy and use this software free of charge. You are allowed to copy, share, modify, and even commercially use this work. You must always give proper attribution to the original creator and release any modified versions under the same [CC BY-SA 4.0](https://de.wikipedia.org/wiki/Creative_Commons) license.

## Citation
Jurk, Inka: *dhimapp. DH Framework designed to visualize historical datasets in a multilayered and interactive map*, Johannes-Gutenberg-University Mainz 2026, licensed under CC BY-SA 4.0. Source: [https://dhimapp.vercel.app/](https://dhimapp.vercel.app/) 

You must specify if original source was modified.

## Third-Party Data Sources
The live demo of this project utilizes data from several external authorities:
* **[GND (Gemeinsame Normdatei)](https://gnd.network/)**: Data is provided under CC0 1.0.
* **[GeoNames](https://www.geonames.org/)**: Data is licensed under a Creative Commons Attribution 4.0 License.
* **[Correspondences of Early Romanticism](https://zenodo.org/records/17468426)**: Suárez Cronauer, E., Fath, L., Strobel, J., Weyand, S., Burch, T., & Deicke, A. (2025). Correspondences of Early Romanticism – RDF-serialisation [Data set]. Zenodo. [https://doi.org/10.5281/zenodo.17468426](https://doi.org/10.5281/zenodo.17468426)
`;

export default function LicenseView() {
  return (
    <StaticContentView title="License & Terms of Use">
      <MarkdownRenderer content={licenseMarkdown} />
    </StaticContentView>
  );
}
