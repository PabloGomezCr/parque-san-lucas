import {
  LayoutGrid,
  ClipboardList,
  Users,
  Wrench,
  Landmark,
  Rabbit,
  Map,
  MapPinned,
  Droplet,
  ChartColumn,
  UserRound,
  MessageCircle,
  UsersRound,
  AlertTriangle,
} from "lucide-react";
export const navigation = [
  {
    path: "/dashboard",
    permission: "dashboard.view",
    label: "Inicio",
    icon: LayoutGrid,
  },
  {
    path: "/tours",
    permission: "tour.view",
    label: "Mis recorridos",
    icon: Map,
  },
  {
    path: "/visitors",
    permission: "visitor_group.view",
    label: "Visitantes",
    icon: UsersRound,
  },
  {
    path: "/park-info",
    permission: "park_info.view",
    label: "Información del parque",
    icon: MapPinned,
  },
  {
    path: "/tasks",
    permission: "task.view",
    label: "Tareas",
    icon: ClipboardList,
  },
  {
    path: "/tourists",
    permission: "tourist.view",
    label: "Turistas",
    icon: Users,
    excludePermission: "visitor_group.view",
  },
  {
    path: "/maintenance",
    permission: "maintenance.view",
    label: "Mantenimiento",
    icon: Wrench,
  },
  {
    path: "/heritage",
    permission: "heritage.view",
    label: "Patrimonio",
    icon: Landmark,
  },
  {
    path: "/species",
    permission: "species.view",
    label: "Especies",
    icon: Rabbit,
  },
  {
    path: "/well-monitoring",
    permission: "well.view",
    label: "Pozo de Agua",
    icon: Droplet,
  },
  {
    path: "/reports",
    permission: "reports.view",
    label: "Reportes",
    icon: ChartColumn,
  },
  {
    path: "/incidents",
    permission: ["incident.view", "incident.view_own"],
    label: "Incidencias",
    icon: AlertTriangle,
  },
  {
    path: "/users",
    label: "Usuarios",
    icon: UsersRound,
    permission: "users.view",
  },
  {
    path: "/chat",
    label: "Chat",
    icon: MessageCircle,
    permission: ["chat.group", "chat.direct_admin"],
  },
  {
    path: "/profile",
    permission: "profile.view",
    label: "Perfil",
    icon: UserRound,
  },
];

export const getNavigation = (can) =>
  navigation.filter((item) => {
    const permitted = Array.isArray(item.permission)
      ? item.permission.some(can)
      : can(item.permission);
    return (
      permitted && (!item.excludePermission || !can(item.excludePermission))
    );
  });
