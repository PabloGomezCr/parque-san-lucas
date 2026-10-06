# Auditoría Stitch → React

Fuente: `stitch_monitoreo_de_parques_nacionales.zip` (Descargas). Auditoría de todas las carpetas antes de implementar.

Prioridad: captura → HTML → patrones → interpretación. Las pantallas numeradas son referencia del módulo; las versiones previas complementan contenido. Un único shell reutiliza el sidebar de las pantallas de tareas (288 px, topbar 64 px). Los datos operativos de las capturas son demostrativos: la aplicación calcula desde db.json. Referencias al Coco no redefinen el parque activo; asociación del pozo por validar.

| Pantalla | Destino | Tipo | Captura |
|---|---|---|---|
| a01_iniciar_sesi_n | LoginPage | PAGE BASE | 1600 × 1280 |
| a02_login_loading | LoginPage | STATE | 1600 × 1280 |
| a03_error_de_credenciales | LoginPage | STATE | 1600 × 1280 |
| atenci_n_de_turistas_y_control_de_aforo_parque_nacional_isla_san_lucas | TouristAttentionPage | VIEW MODE | 1190 × 1600 |
| branding_board_maestro_fondo_claro_editorial | public/assets/branding + tokens | BRANDING REFERENCE | 432 × 1600 |
| branding_board_maestro_fondo_oscuro_premium_t_ctico | public/assets/branding + tokens | BRANDING REFERENCE | 452 × 1600 |
| captura_de_pantalla_2026_09_29_a_la_s_14.38.02.png | Referencia visual original | MOCKUP REFERENCE | 1434 × 426 |
| d01_dashboard_resumen_del_parque | DashboardPage | PAGE BASE | 1160 × 1600 |
| d02_dashboard_loading | DashboardPage | STATE | 1501 × 1600 |
| d03_dashboard_sin_informaci_n | DashboardPage | STATE | 1420 × 1600 |
| dashboard_resumen_del_parque_isla_san_lucas | DashboardPage | VIEW MODE | 1149 × 1600 |
| ds01_design_system_y_ui_kit_oficial | src/styles + components | COMPONENT | 539 × 1600 |
| e01_inventario_de_especies | SpeciesPage | PAGE BASE | 1010 × 1600 |
| e02_registrar_especie | SpeciesFormPage | FORM MODE | 1203 × 1600 |
| e03_ficha_de_especie | SpeciesDetailPage | PAGE BASE | 1078 × 1600 |
| e04_registrar_observaci_n | SpeciesDetailPage / ObservationForm | MODAL | 950 × 1600 |
| e05_editar_especie | SpeciesFormPage | FORM MODE | 1403 × 1600 |
| e06_inventario_vac_o | SpeciesPage | STATE | 1459 × 1600 |
| e07_sin_resultados_de_b_squeda | SpeciesPage | STATE | 1107 × 1600 |
| e08_especies_loading | SpeciesPage | STATE | 1299 × 1600 |
| e09_error_de_especies | SpeciesPage | STATE | 1410 × 1600 |
| e10_confirmaci_n_de_registro_de_especie | SpeciesPage | STATE | 1566 × 1600 |
| emblema_oficial_parques_nacionales | public/assets/branding + tokens | BRANDING REFERENCE | 1024 × 1024 |
| inventario_de_especies_parque_nacional_isla_san_lucas | SpeciesPage | VIEW MODE | 1088 × 1600 |
| l_mina_01_portada | public/assets/branding + tokens | BRANDING REFERENCE | 1600 × 1280 |
| l_mina_02_introducci_n | public/assets/branding + tokens | BRANDING REFERENCE | 1600 × 1280 |
| l_mina_03_contexto_del_proyecto | public/assets/branding + tokens | BRANDING REFERENCE | 1600 × 1280 |
| l_mina_04_adn_de_marca | public/assets/branding + tokens | BRANDING REFERENCE | 1600 × 1280 |
| l_mina_05_personalidad_de_marca | public/assets/branding + tokens | BRANDING REFERENCE | 1600 × 1280 |
| l_mina_06_concepto_de_marca | public/assets/branding + tokens | BRANDING REFERENCE | 1600 × 1280 |
| l_mina_07_s_mbolo_central_el_pel_cano | public/assets/branding + tokens | BRANDING REFERENCE | 1600 × 1280 |
| l_mina_08_construcci_n_del_pel_cano | public/assets/branding + tokens | BRANDING REFERENCE | 1600 × 1280 |
| l_mina_09_logo_principal | public/assets/branding + tokens | BRANDING REFERENCE | 1600 × 1280 |
| l_mina_10_logo_horizontal | public/assets/branding + tokens | BRANDING REFERENCE | 1600 × 1280 |
| l_mina_11_logo_vertical | public/assets/branding + tokens | BRANDING REFERENCE | 1600 × 1280 |
| l_mina_12_isotipo_icono_favicon | public/assets/branding + tokens | BRANDING REFERENCE | 1600 × 1280 |
| l_mina_13_versiones_del_logo | public/assets/branding + tokens | BRANDING REFERENCE | 1283 × 1600 |
| l_mina_14_zona_de_seguridad | public/assets/branding + tokens | BRANDING REFERENCE | 1411 × 1600 |
| l_mina_15_tama_o_m_nimo | public/assets/branding + tokens | BRANDING REFERENCE | 1471 × 1600 |
| l_mina_16_usos_incorrectos | public/assets/branding + tokens | BRANDING REFERENCE | 1253 × 1600 |
| l_mina_17_paleta_principal | public/assets/branding + tokens | BRANDING REFERENCE | 1600 × 1549 |
| l_mina_18_paleta_light_mode | public/assets/branding + tokens | BRANDING REFERENCE | 1033 × 1600 |
| l_mina_19_paleta_dark_mode | public/assets/branding + tokens | BRANDING REFERENCE | 555 × 1600 |
| l_mina_20_tipograf_a | public/assets/branding + tokens | BRANDING REFERENCE | 850 × 1600 |
| l_mina_21_iconograf_a | public/assets/branding + tokens | BRANDING REFERENCE | 1410 × 1600 |
| l_mina_22_sistema_gr_fico_complementario | public/assets/branding + tokens | BRANDING REFERENCE | 1071 × 1600 |
| l_mina_23_estilo_fotogr_fico | public/assets/branding + tokens | BRANDING REFERENCE | 705 × 1600 |
| l_mina_24_tono_de_comunicaci_n | public/assets/branding + tokens | BRANDING REFERENCE | 631 × 1600 |
| l_mina_25_papeler_a_institucional | public/assets/branding + tokens | BRANDING REFERENCE | 884 × 1600 |
| l_mina_26_cuadernos_y_material_de_campo | public/assets/branding + tokens | BRANDING REFERENCE | 932 × 1600 |
| l_mina_27_camisas_y_uniformes | public/assets/branding + tokens | BRANDING REFERENCE | 457 × 1600 |
| l_mina_28_veh_culos_y_camiones | public/assets/branding + tokens | BRANDING REFERENCE | 939 × 1600 |
| l_mina_29_vallas_pancartas_y_se_alizaci_n | public/assets/branding + tokens | BRANDING REFERENCE | 846 × 1600 |
| l_mina_30_aplicaci_n_digital | public/assets/branding + tokens | BRANDING REFERENCE | 834 × 1600 |
| l_mina_31_comparativa_light_mode_vs_dark_mode_digital | public/assets/branding + tokens | BRANDING REFERENCE | 1030 × 1600 |
| l_mina_32_cierre_de_marca | public/assets/branding + tokens | BRANDING REFERENCE | 1034 × 1600 |
| liquid_insular | src/styles + components | COMPONENT | — |
| m07_mantenimiento_loading | MaintenancePage | STATE | 1588 × 1600 |
| m08_error_de_mantenimiento | MaintenancePage | STATE | 1262 × 1600 |
| monitoreo_del_pozo_de_agua_isla_del_coco | WellMonitoringPage | VIEW MODE | 1199 × 1600 |
| p01_intervenciones_de_patrimonio_cultural | HeritagePage | PAGE BASE | 1145 × 1600 |
| p02_registrar_intervenci_n | HeritageFormPage | FORM MODE | 931 × 1600 |
| p03_detalle_de_intervenci_n | HeritageDetailPage | PAGE BASE | 701 × 1600 |
| p04_editar_intervenci_n | HeritageFormPage | FORM MODE | 1238 × 1600 |
| p05_agregar_evidencia | HeritageDetailPage / EvidenceDialog | MODAL | 1600 × 1280 |
| p06_sin_intervenciones | HeritagePage | STATE | 1575 × 1600 |
| p07_patrimonio_loading | HeritagePage | STATE | 1600 × 1422 |
| p08_error_de_patrimonio | HeritagePage | STATE | 1132 × 1600 |
| patrimonio_cultural_e_hist_rico_parque_nacional_isla_san_lucas | HeritagePage | VIEW MODE | 818 × 1600 |
| perfil_del_guardaparque_y_preferencias_sistema_de_monitoreo | ProfilePage | VIEW MODE | 1468 × 1600 |
| pf02_preferencias | ProfilePage | VIEW MODE | 1118 × 1600 |
| pf03_cambiar_contrase_a | ProfilePage | VIEW MODE | 1280 × 1600 |
| pf04_confirmar_cierre_de_sesi_n | ConfirmDialog | MODAL | 1600 × 1280 |
| r04_reporte_sin_informaci_n | ReportsPage | STATE | 1506 × 1600 |
| r05_reportes_loading | ReportsPage | STATE | 1440 × 1600 |
| r06_error_de_reportes | ReportsPage | STATE | 1539 × 1600 |
| reparaciones_y_mantenimiento_parque_nacional_isla_san_lucas | MaintenancePage | VIEW MODE | 1167 × 1600 |
| reportes_consolidados_y_exportaci_n_oficial_parque_nacional_isla_san_lucas | ReportsPage | VIEW MODE | 565 × 1600 |
| s01_acceso_restringido | UnauthorizedPage | SYSTEM STATE | 1600 × 1280 |
| s02_error_general | ErrorState | SYSTEM STATE | 1600 × 1280 |
| s03_empty_state_general | EmptyState | SYSTEM STATE | 1600 × 1530 |
| s04_confirmaci_n_destructiva | ConfirmDialog | MODAL | 1600 × 1280 |
| t01_tareas_vista_lista | TasksPage | VIEW MODE | 1519 × 1600 |
| t02_tareas_vista_kanban | TasksPage | VIEW MODE | 1600 × 1540 |
| t03_registrar_nueva_tarea | TaskFormPage | FORM MODE | 1600 × 1590 |
| t04_detalle_de_tarea | TaskDetailPage | PAGE BASE | 1248 × 1600 |
| t05_editar_tarea | TaskFormPage | FORM MODE | 1295 × 1600 |
| t06_confirmar_cambio_de_estado | ConfirmDialog | MODAL | 1600 × 1280 |
| t07_confirmar_finalizaci_n | ConfirmDialog | MODAL | 1600 × 1280 |
| t08_tareas_sin_resultados | TasksPage | STATE | 1600 × 1280 |
| t09_tareas_loading | TasksPage | STATE | 1600 × 1580 |
| t10_error_al_cargar_tareas | TasksPage | STATE | 1507 × 1600 |
| tareas_operativas_parque_nacional_isla_san_lucas | TasksPage | VIEW MODE | 1408 × 1600 |
| tu01_atenci_n_de_turistas | TouristAttentionPage | PAGE BASE | 1151 × 1600 |
| tu02_registrar_atenci_n | TouristAttentionFormPage | FORM MODE | 1341 × 1600 |
| tu03_detalle_de_atenci_n | TouristAttentionDetailPage | PAGE BASE | 1158 × 1600 |
| w01_monitoreo_del_pozo | WellMonitoringPage | PAGE BASE | 1284 × 1600 |
| w02_hist_rico_del_pozo | WellMonitoringPage | VIEW MODE | 961 × 1600 |
| w03_detalle_de_lectura | WellMonitoringPage | DRAWER | 930 × 1600 |
| w04_sin_lecturas_disponibles | WellMonitoringPage | STATE | 1600 × 1554 |
| w05_pozo_loading | WellMonitoringPage | STATE | 1465 × 1600 |

22 páginas existentes; formularios nuevos/edición compartidos. Los estados no añaden rutas. No hay referencia específica de NotFoundPage; aplica componentes del sistema.
