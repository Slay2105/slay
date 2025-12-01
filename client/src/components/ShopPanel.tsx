import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../lib/api";
import { ShopItem } from "../types";
import { useAuthStore } from "../store/useAuth";

const ShopPanel = () => {
  const queryClient = useQueryClient();
  const { token, hydrate } = useAuthStore();
  const { data: shopData } = useQuery({
    queryKey: ["shop-items"],
    queryFn: async () => {
      const { data } = await api.get("/shop/items");
      return data.items as ShopItem[];
    }
  });

  const { data: inventoryData } = useQuery({
    queryKey: ["inventory"],
    queryFn: async () => {
      const { data } = await api.get("/shop/inventory");
      return data.inventory as { itemId: string }[];
    },
    staleTime: 10_000,
    enabled: Boolean(token)
  });

  const purchase = useMutation({
    mutationFn: (itemId: string) => api.post("/shop/purchase", { itemId }),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      await hydrate();
    }
  });

  return (
    <div className="panel shop-panel">
      <div className="panel-header">
        <p className="panel-label">CỬA HÀNG SKIN</p>
      </div>
      <div className="shop-grid">
        {shopData?.map((item) => {
          const owned = inventoryData?.some((entry) => entry.itemId === item.id);
          return (
            <div key={item.id} className={`shop-card rarity-${item.rarity}`}>
              <div>
                <h4>{item.name}</h4>
                <p>{item.description}</p>
              </div>
              <button
                type="button"
                disabled={owned || purchase.isPending || !token}
                onClick={() => purchase.mutate(item.id)}
              >
                {owned ? "Đã sở hữu" : token ? `${item.price} coin` : "Đăng nhập"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ShopPanel;
