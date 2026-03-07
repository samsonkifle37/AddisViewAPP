async function fix() {
    const res = await fetch("http://localhost:3000/api/admin/images/force-update");
    const d = await res.json();
    console.log(d);
}
fix();
