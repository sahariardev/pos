// components/ReceiptPDF.tsx
import React from 'react';
import {
  Document,
  Page,
  Text,
  Image,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';

// Optional: Register monospaced font for receipt feel
Font.register({
  family: 'RobotoMono',
  src: '/RobotoMono-Regular.ttf',
});

const styles = StyleSheet.create({
  page: {
    padding: 10,
    fontSize: 10,
    fontFamily: 'RobotoMono',
    width: '58mm',
  },
  center: {
    textAlign: 'center',
    marginBottom: 5,
  },
  image: {
    width: 70,
    height: 70,
    marginBottom: 10,
    textAlign: 'center',
  },
  line: {
    borderBottom: '1px dashed #000',
    marginVertical: 5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  itemName: {
    width: '60%', // adjust as needed
    marginRight: 5,
    wordBreak: 'break-word', // or use `wrap: true` if needed
  },
  itemPrice: {
    width: '40%',
    textAlign: 'right',
  },
  bold: {
    fontWeight: 'bold',
  },
});

type ReceiptPDFProps = {
  items: { name: string; quantity: number, price: number }[];
  total: number;
  orderId: number;
  discount: number;
  subtotal: number;
};

export const ReceiptPDF: React.FC<ReceiptPDFProps> = ({ items, total, orderId, discount, subtotal }) => {

  return (<Document>
    <Page size={{ width: 165.35, height: 600 }} style={styles.page}>
      <View style={{ alignItems: 'center', marginBottom: 10 }}>
        <Image
          style={styles.image}
          src="/logo_black_and_white.jpg"
        />
      </View>
      <View>
        <Text style={[styles.center, styles.bold]}>Whatta Cup!</Text>
        <Text style={styles.center}>Doulatpur, Khulna</Text>
        <Text style={styles.center}>Order ID # {orderId % 100}</Text>
        <Text style={styles.center}>------------------------------</Text>
      </View>

      <View>
        {items.map((item, index) => (
          <View style={styles.itemRow} key={index}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemPrice}>{item.quantity}*{item.price} BDT</Text>
          </View>
        ))}
        {discount > 0 ? discountView(total, discount, subtotal) : normalView(total)}
        <Text style={styles.line}></Text>
      </View>

      <View style={styles.center}>
        <Text>Thank You!</Text>
      </View>
    </Page>
  </Document>);
};

const normalView = (total: number) => {
  return (
    <View style={[styles.row, { marginTop: 5 }]}>
      <Text style={styles.bold}>Total</Text>
      <Text style={styles.bold}>{total} BDT</Text>
    </View>
  );
}

const discountView = (total: number, discount: number, subtotal: number) => {
  return (
    <>
      <Text style={styles.line}></Text>
      <View style={[styles.row, { marginTop: 5 }]}>
        <Text style={styles.bold}>Subtotal</Text>
        <Text style={styles.bold}>{subtotal} BDT</Text>
      </View>

      <View style={[styles.row, { marginTop: 5 }]}>
        <Text style={styles.bold}>Discount</Text>
        <Text style={styles.bold}>{discount} %</Text>
      </View>

      <View style={[styles.row, { marginTop: 5 }]}>
        <Text style={styles.bold}>Total</Text>
        <Text style={styles.bold}>{total} BDT</Text>
      </View>
    </>
  );
}
