export default function PaymentSuccess() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const query = new URLSearchParams(useLocation().search);
  const tx_ref = query.get("tx_ref");

  useEffect(() => {
    const confirm = async () => {
      const res = await axios.post(
        "http://localhost:5000/api/payments/confirm",
        {
          transactionRef: tx_ref,
          orderData: {
            restaurantId: state.restaurantId,
            email: state.email,
            customerName: `${state.firstName} ${state.lastName}`,
            items: state.cart.map((item) => ({
              menuItemId: item.menuItemId,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
            })),
            totalPrice: state.amount,
            deliveryAddress: state.address,
          },
        },
      );

      navigate(`/orders/${res.data.orderId}`);
    };

    confirm();
  }, []);

  return <p>Verifying payment...</p>;
}
