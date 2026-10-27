# If Hikari says another device saved changes

*Hikari 0.16.0 and later, web version with Kōbō storage (Google Drive, kDrive).*

## Most of the time you don't need to do anything

- A window left open on another device catches up by itself: within about a minute, or straight
  away when you click back into it. It stays on the photo you were looking at.
- Just looking at photos, opening panels or changing the grid never counts as a change, so an
  old window can't get stuck any more just because you browsed in it.
- A browser that an earlier version left saying "Not synced" with nothing actually changed picks
  up the latest version the next time you open Hikari.

## When both devices really changed the same library

You'll see "Not synced: another device saved changes too", and **Libraries** opens with a choice.
Nothing is overwritten while it waits, and the choice is still there after closing and reopening.

1. **Optional, for peace of mind:** File ▸ Back Up Library (on a phone: More ▸ Back up) saves a
   copy of this device's version to your downloads.
2. Choose one:
   - **Keep both (recommended).** This device's version becomes a library of its own, called
     "*name* (this device's copy)", and the library you had open shows the other device's latest.
     Open the copy from Libraries, check what's in it, and carry on in whichever you prefer.
     Nothing is lost; you can hide the one you don't need (hiding never deletes).
   - **Use this device's version.** Your version becomes the latest; the other device catches up
     to it. The other device's version stays in your storage's history, but Hikari doesn't show it.
     Choose this only if you're sure the other device's changes don't matter.

## Please don't

- Clear the browser's data, delete the storage connection, or restore a backup over a library
  that's connected to storage, to "fix" a sync warning. Use the choice in Libraries instead.
- Delete the original photo files you imported until you've seen them on a second device.

## If something still looks wrong

Make a backup (step 1 above), note the time and both devices/browsers, and send a screenshot.
Use the device that shows the newest work in the meantime.
