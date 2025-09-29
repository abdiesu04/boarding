// "use client";

// import { useState, useEffect } from "react";
// import dynamic from "next/dynamic";
// import {
//   Document,
//   Page,
//   View,
//   Text,
//   Image,
//   PDFViewer,
//   StyleSheet,
//   Font,
// } from "@react-pdf/renderer";

// // Register custom font
// Font.register({ family: "Inter", src: "/assets/font.otf" });

// const styles = StyleSheet.create({
//   body: {
//     paddingTop: 20,
//     fontFamily: "Inter",
//   },
//   page: {
//     padding: 20,
//     fontFamily: "Inter",
//   },
// });

// // Dynamically import PDF component (client-side only)
// const InvoicePDF = dynamic(
//   () =>
//     Promise.resolve(function InvoicePDF({ url }: { url: string }) {
//       return (
//         <Document>
//           <Page style={styles.page}>
//             <View
//               style={{
//                 display: "flex",
//                 flexDirection: "column",
//                 justifyContent: "center",
//               }}
//             >
//               <Text wrap={false} style={{ alignSelf: "flex-end" }}>
//                 This is a dynamic PDF example from Cloudinary.
//               </Text>
//             </View>
//             <View>
//               <Image src={url} />
//             </View>
//           </Page>
//         </Document>
//       );
//     }),
//   { ssr: false }
// );

// interface PDFViewProps {
//   cloudinaryUrl: string;
// }

// const PDFView = ({ cloudinaryUrl }: PDFViewProps) => {
//   const [client, setClient] = useState(false);

//   useEffect(() => {
//     setClient(true);
//   }, []);

//   if (!client) return null;

//   return (
//     <PDFViewer width="100%" height="600">
//       <InvoicePDF url={cloudinaryUrl} />
//     </PDFViewer>
//   );
// };

// export default PDFView;
