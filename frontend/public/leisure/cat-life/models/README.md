# Golden Shaded Cat Model

将模型文件放在本目录，文件名必须是：

`golden-shaded-cat.glb`

当前 Three.js 加载器会自动读取模型中的这些动画：

`Idle`, `Idle_Blink`, `Idle_LookAround`, `Walk`, `Run`, `Sit`, `Stand`, `Sleep`, `Eat`, `Drink`, `Groom`, `Stretch`, `Play`, `Jump`, `Scratch`, `Meow`, `Scared`

建议移动端规格：20k-80k triangles、PBR 材质、单个 CatArmature、15-20 个动画。Sketchfab 模型请先确认下载许可，再放入本目录。

项目内另有 `golden-shaded-cat-custom.glb`，由 `npm run make-cat` 生成，是当前默认加载的自制低模版本。
